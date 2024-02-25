import { html, component, use, tw, setAtomValue, nothing, repeat, atom, getAtomValue, persistentAtom, ref } from 'maki';
import { nanoid } from 'nanoid';
import "zero-md";
import '@polymer/iron-autogrow-textarea/iron-autogrow-textarea.js';

const $models = atom<any[]>([]);
const $model = persistentAtom('model', 'mistral:latest');
const $role = persistentAtom('role', 'user');
fetch('http://localhost:11434/api/tags')
    .then((response) => response.json())
    .then((data) => setAtomValue($models, data?.models?.map(({ name }) => name)))
    .catch(console.error);

const $responses = persistentAtom<{
    uuid: string;
    role: string;
    content: string;
}[]>('generated-responses', []);

component<{}>(() => {
    return () => html`
        <div class=${tw("grid w-full m-0 p-0")} style="min-height: 100dvh; grid-template-rows: auto 1fr;">
            <div class=${tw('top-0 right-0 sticky z-10 inline-flex gap-4 p-4 flex justify-end border-b-1 border-b-black border-b-opacity-30')} style="background: #121212">
                <div class=${tw("mr-auto my-auto font-bold")}>HubChat</div>
                <app-select-role></app-select-role>
                <app-select-model></app-select-model>
            </div>
            <app-chat></app-chat>
        </div>
    `;
}).as('app-root');

component(() => {
    const [models] = use($models);
    const [model, setModel] = use($model);
    return () => html`
        <select
            class=${tw("px-2 py-2 rounded text-white")}
            .value=${model()}
            @change=${(e: Event) => setModel((e.target as HTMLSelectElement).value)}>
            ${repeat(models(), x => x, (name) => html`
                <option value=${name} ?selected=${name === model()}>${name}</option>
            `)}
        </select>
    `;
}).as('app-select-model');

component(() => {
    const roles = ['user', 'assistant', 'system'];
    const [role, setRole] = use($role);
    return () => html`
        <select
            class=${tw("px-2 py-2 rounded text-white")}
            .value=${role()}
            @change=${(e: Event) => setRole((e.target as HTMLSelectElement).value)}>
            ${repeat(roles, x => x, (name) => html`
                <option value=${name} ?selected=${name === role()}>${name}</option>
            `)}
        </select>
    `;
}).as('app-select-role');

component<{}>(() => {
    let recent: HTMLElement = null;
    let inputRef: HTMLElement = null;
    const [isGenerating, setIsGenerating] = use(false);
    const [prompt, setPrompt] = use("");
    const [promptImages, setPromptImages] = use<string[]>([]);
    const [content, setContent] = use<any>("");

    async function updatePrompt(e: MakiInputEvent<HTMLInputElement>) {
        return setPrompt(e.target.value);
    }

    function imagesChange(e: MakiInputEvent<HTMLInputElement>) {
        setPromptImages([]);
        if (!e.target.files) return console.log('no files');
        const reader = new FileReader();
        reader.addEventListener('load', (e) => setPromptImages((current) => [...current, e.target?.result?.toString().split(',')[1]]));
        for (let file of Array.from(e.target.files)) {
            reader.readAsDataURL(file);
        }
    }

    async function onSubmit(e: Event) {
        e.preventDefault();
        if (isGenerating()) return console.log('already generating');
        setAtomValue($responses, (current) => [...current, {
            uuid: nanoid(20),
            role: getAtomValue($role),
            content: prompt(),
        }]);
        setPrompt('');
        setContent('');
        setIsGenerating(true);

        const hasPrompt = prompt() && prompt().trim().length > 0;

        const chat = await fetch('http://localhost:11434/api/chat', {
            method: 'post',
            body: JSON.stringify({
                model: getAtomValue($model),
                messages: [
                    ...getAtomValue($responses).map(({ role, content }) => ({ role, content })),
                    hasPrompt && {
                        role: getAtomValue($role),
                        content: prompt(),
                        images: promptImages(),
                    },
                ].filter(Boolean),
            }),
        });
        const reader = chat.body?.getReader();
        const decoder = new TextDecoder();

        reader.read().then(function processText({ done, value }) {
            if (done) {
                setAtomValue($responses, (current) => [...current, {
                    uuid: nanoid(20),
                    role: 'assistant',
                    content: content(),
                }]);
                setContent('');
                setIsGenerating(false);
                recent && window.scrollTo({ top: recent.offsetTop });
                inputRef?.focus();
                return console.log('Stream complete');
            }
            const string = decoder.decode(value, { stream: true });
            const data = JSON.parse(string);
            setContent((current) => `${current}${data?.message?.content}`);

            recent && window.scrollTo({ top: recent.offsetTop });
            return reader.read().then(processText);
        });
        setPrompt('');
        if (!chat.ok) throw new Error(chat.statusText);
    }

    const keyup = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) { return onSubmit(e); }
    };

    return () => html`
        <div class=${tw("grid")} style="grid-template-rows: 1fr auto; min-height: 100%;">
            <app-model-responses class=${tw('p-4')}>
                ${content() ? html`<app-model-response role="assistant" ref=${ref(((x: HTMLElement) => (recent = x)))}>
                    <zero-markdown content=${content()}></zero-markdown>
                </app-model-response>` : nothing}
            </app-model-responses>
            <form class=${tw("flex flex-row gap-3 p-4 items-stretch bottom-0 left-0 right-0 sticky z-10 items-end border-t-1 border-t-black border-t-opacity-30")} @submit=${onSubmit} style="background: #121212">
                <iron-autogrow-textarea type="text"
                    class=${tw("p-1 rounded w-full border-r-1 border-r-black border-r-opacity-30")}
                    @input=${updatePrompt}
                    @keyup=${keyup}
                    .value=${prompt()}
                    max-rows="5"
                    ref=${ref((x: HTMLInputElement) => (inputRef = x))}
                    placeholder="Message..."></iron-autogrow-textarea>
                <slot></slot>
                <button type="button"
                    title="clear"
                    class=${tw("py-1 px-2 rounded text-white hover:bg-white hover:bg-opacity-5 disabled:opacity-10")}
                    @click=${() => setAtomValue($responses, () => [])}>
                    ✖
                </button>
                <label class=${tw("p-1 rounded text-white hover:bg-white hover:bg-opacity-5 cursor-pointer relative")}
                    title="Add images"
                    for="images">
                    <input type="file"
                        multiple
                        class=${tw("p-1 rounded w-18 absolute top-0 left-0 right-0 bottom-0 opacity-0")}
                        @change=${imagesChange} />
                    <span>📌</span>
                </label>
                <button type="submit"
                    title="Send"
                    class=${tw("py-1 px-2 rounded text-white hover:bg-white hover:bg-opacity-5 disabled:opacity-10")}
                    .disabled=${isGenerating()}>
                    <span>▶</span>
                </button>
            </form>
        </div>
    `;
}).as('app-chat');

component<{}>(() => {
    const [responses] = use($responses);
    return () => html`
        <div class=${tw("flex flex-col gap-4 overflow-auto")}>
            ${repeat(responses(), x => x.uuid, (response) => html`
                <app-model-response role=${response.role}>
                    <zero-markdown content=${response.content}></zero-markdown>
                </app-model-response>
            `)}
            <slot></slot>
        </div>
    `;
}).as('app-model-responses');

component<{ role: string; }>(() => {
    return ({ role }) => {
        if (role === 'system') return html`<div class=${tw("w-full text-sm text-center py-4 text-white text-opacity-60")}>
            <slot></slot>
        </div>`;

        return html`
            <div class=${tw("host:inline-block p-4 rounded-lg shadow max-w-prose bg-white", role === 'user' ? 'ml-auto bg-opacity-5' : 'bg-opacity-10 mr-auto')} style="width: fit-content;">
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
