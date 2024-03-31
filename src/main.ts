import { html, component, use, tw, persistentAtom, isotope } from 'maki';
import { nanoid } from 'nanoid';
import { repeat } from 'lit-html/directives/repeat.js';
import { ref } from 'lit-html/directives/ref.js';
import "zero-md";
import '@polymer/iron-autogrow-textarea/iron-autogrow-textarea.js';

const $models = isotope<any[]>([]);
const $model = isotope(persistentAtom('model', 'mistral:latest'));
const $role = isotope(persistentAtom('role', 'user'));

fetch('http://localhost:11434/api/tags')
    .then((response) => response.json())
    .then((data) => $models(data?.models?.map(({ name }) => name)))
    .catch(console.error);

const $responses = isotope(persistentAtom<{
    uuid: string;
    role: string;
    content: string;
}[]>('generated-responses', []));

component<{}>(() => {
    return () => html`
        <div class="grid w-full m-0 p-0 min-h-[100dvh]" style="grid-template-rows: auto 1fr;">
            <div class="top-0 right-0 sticky z-10 inline-flex gap-4 p-4 flex justify-end border-b-1 border-b-black border-b-opacity-30 bg-[#121212]">
                <div class="mr-auto my-auto font-bold">🗣HubChat</div>
                <app-select-role></app-select-role>
                <app-select-model></app-select-model>
            </div>
            <app-chat></app-chat>
        </div>
    `;
}).as('app-root');

component(() => {
    const models = use($models);
    const model = use($model);
    return () => html`
        <select
            class="p-2 rounded"
            .value=${model()}
            @change=${(e: Event) => model((e.target as HTMLSelectElement).value)}>
            ${repeat(models(), x => x, (name) => html`
                <option value=${name} ?selected=${name === model()}>${name}</option>
            `)}
        </select>
    `;
}).as('app-select-model');

component(() => {
    const roles = ['user', 'assistant', 'system'];
    const role = use($role);
    return () => html`
        <select
            class="p-2 rounded"
            .value=${role()}
            @change=${(e: Event) => role((e.target as HTMLSelectElement).value)}>
            ${repeat(roles, x => x, (name) => html`
                <option value=${name} ?selected=${name === role()}>${name}</option>
            `)}
        </select>
    `;
}).as('app-select-role');

component<{}>(() => {
    let recent: HTMLElement = null;
    let inputRef: HTMLElement = null;
    const isGenerating = use(false);
    const prompt = use("");
    const promptImages = use<string[]>([]);
    const content = use<any>("");

    async function updatePrompt(e: MakiInputEvent<HTMLInputElement>) {
        return prompt(e.target.value);
    }

    function imagesChange(e: MakiInputEvent<HTMLInputElement>) {
        promptImages([]);
        if (!e.target.files) return console.log('no files');
        const reader = new FileReader();
        reader.addEventListener('load', (e) => promptImages((current) => [...current, e.target?.result?.toString().split(',')[1]]));
        for (let file of Array.from(e.target.files)) {
            reader.readAsDataURL(file);
        }
    }

    async function onSubmit(e: Event) {
        e.preventDefault();
        if (isGenerating()) return console.log('already generating');
        $responses((current) => [...current, {
            uuid: nanoid(20),
            role: $role(),
            content: prompt(),
        }]);
        prompt('');
        content('');
        isGenerating(true);

        const hasPrompt = prompt() && prompt().trim().length > 0;

        const chat = await fetch('http://localhost:11434/api/chat', {
            method: 'post',
            body: JSON.stringify({
                model: $model(),
                messages: [
                    ...$responses().map(({ role, content }) => ({ role, content })),
                    hasPrompt && {
                        role: $role(),
                        content: prompt(),
                        images: promptImages(),
                    },
                ].filter(Boolean),
            }),
        });
        const reader = chat.body?.getReader();
        const decoder = new TextDecoder();

        let chunks = 0;

        reader.read().then(function processText({ done, value }) {
            if (done || chunks++ > 5000) {
                $responses((current) => [...current, {
                    uuid: nanoid(20),
                    role: 'assistant',
                    content: content(),
                }]);
                content('');
                isGenerating(false);
                recent && window.scrollTo({ top: recent.offsetTop });
                inputRef?.focus();
                return console.log('Stream complete');
            }

            const string = decoder.decode(value, { stream: true });
            const data = JSON.parse(string);
            content((current) => `${current}${data?.message?.content}`);

            recent && window.scrollTo({ top: recent.offsetTop });
            return reader.read().then(processText);
        });
        prompt('');
        if (!chat.ok) throw new Error(chat.statusText);
    }

    const keyup = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) { return onSubmit(e); }
    };

    return () => html`
        <div class=${tw`grid min-h-full grid-template-rows-[1fr,auto]`} style="grid-template-rows: 1fr auto;">
            <app-model-responses class="p-4">
                ${content() ? html`<app-model-response data-role="assistant" ref=${ref(((x: HTMLElement) => (recent = x)))}>
                    <zero-markdown content=${content()}></zero-markdown>
                </app-model-response>` : null}
            </app-model-responses>
            <form class="flex flex-row gap-3 p-4 items-stretch bottom-0 left-0 right-0 sticky z-10 items-end border-t-1 border-t-black border-t-opacity-30 bg-[#121212]" @submit=${onSubmit}>
                <iron-autogrow-textarea type="text"
                    class="p-1 rounded w-full border-r-1 border-r-black border-r-opacity-30"
                    @input=${updatePrompt}
                    @keyup=${keyup}
                    .value=${prompt()}
                    max-rows="5"
                    ref=${ref((x: HTMLInputElement) => (inputRef = x))}
                    placeholder="Message..."></iron-autogrow-textarea>
                <slot></slot>
                <button type="button"
                    title="clear"
                    class="py-1 px-2 rounded text-white hover:bg-white hover:bg-opacity-5 disabled:opacity-10"
                    @click=${() => $responses(() => [])}>
                    ✖
                </button>
                <!-- <label class="p-1 rounded text-white hover:bg-white hover:bg-opacity-5 cursor-pointer relative"
                    title="Add images"
                    for="images">
                    <input type="file"
                        multiple
                        class="p-1 rounded w-18 absolute top-0 left-0 right-0 bottom-0 opacity-0"
                        @change=${imagesChange} />
                    <span>📌</span>
                </label> -->
                <button type="submit"
                    title="Send"
                    class=${tw("py-1 px-2 rounded text-white hover:bg-white hover:bg-opacity-5 disabled:(opacity-10 cursor-progress)")}
                    .disabled=${isGenerating()}>
                    <span>▶</span>
                </button>
            </form>
        </div>
    `;
}).as('app-chat');

component<{}>(() => {
    const responses = use($responses);
    return () => html`
        <div class="flex flex-col gap-4 overflow-auto">
            ${repeat(responses(), x => x.uuid, (response) => html`
                <app-model-response data-role=${response.role}>
                    <zero-markdown content=${response.content}></zero-markdown>
                </app-model-response>
            `)}
            <slot></slot>
        </div>
    `;
}).as('app-model-responses');

component<{ 'data-role': string; }>(() => {
    return ({ 'data-role': role }) => {
        if (role === 'system') return html`<div class="w-full text-sm text-center py-4 text-white text-opacity-60">
            <slot></slot>
        </div>`;

        return html`
            <div class=${tw("host:inline-block p-4 rounded-lg shadow max-w-prose bg-white w-[fit-content]", role === 'user' ? 'ml-auto bg-opacity-5' : 'bg-opacity-10 mr-auto')}>
                <slot></slot>
            </div>
        `;
    };
}).as('app-model-response');

component<{ content: string; }>(() => {
    return ({ content }) => html`
        <zero-md>
            <template>
                <style>
                    :host: { display: contents; max-width: 100%; background: transparent; }
                    p { margin-top: 0; margin-bottom: 1em; }
                    ul, ol { padding-left: 1em; }
                    pre, code { white-space: pre-wrap; padding: 0.5em; background: #212121; color: white; }
                    :first-child { margin-top: 0; }
                    :last-child { margin-bottom: 0; }
                </style>
            </template>
            <script type="text/markdown">${content}</script>
        </zero-md>
    `;
}).as('zero-markdown');

interface MakiInputEvent<T> extends InputEvent {
    target: T & EventTarget;
}
