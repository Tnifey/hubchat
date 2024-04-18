import "@polymer/iron-autogrow-textarea/iron-autogrow-textarea.js";
import { ref } from "lit-html/directives/ref.js";
import { component, html, tw, use } from "maki";
import { nanoid } from "nanoid";

import { $api, $model, $responses, $role } from "./state";

import "./app-model-responses";

import "./app-settings";
import { streamChat } from "./chat";

component(() => {
    const api = use($api)
    return () => {
        return html`
            <div class="grid w-full m-0 p-0 min-h-[100dvh]" style="grid-template-rows: auto 1fr;">
                <div class="top-0 right-0 sticky z-10 inline-flex gap-4 p-4 flex justify-end border-b-1 border-b-black border-b-opacity-30 bg-[#121212]">
                    <div class="mr-auto my-auto font-bold">🗣HubChat</div>
                    <app-select-role></app-select-role>
                    <app-select-model></app-select-model>
                    <!-- <app-settings></app-settings> -->
                </div>
                <app-chat></app-chat>
            </div>
        `;
    };
}).as("app-root");

component(() => {
    let recent: HTMLElement = null;
    let inputRef: HTMLElement = null;
    const isGenerating = use(false);
    const prompt = use("");
    const promptImages = use<string[]>([]);
    const content = use<string>("");

    async function updatePrompt(e: MakiInputEvent<HTMLInputElement>) {
        return prompt(e.target.value);
    }

    function imagesChange(e: MakiInputEvent<HTMLInputElement>) {
        promptImages([]);
        if (!e.target.files) return console.log("no files");
        const reader = new FileReader();
        reader.addEventListener("load", (e) =>
            promptImages((current) => [...current, e.target?.result?.toString().split(",")[1]]),
        );
        for (const file of Array.from(e.target.files)) {
            reader.readAsDataURL(file);
        }
    }

    async function onSubmit(e: Event) {
        e.preventDefault();
        if (isGenerating()) return console.log("already generating");
        $responses((current) => [
            ...current,
            {
                uuid: nanoid(20),
                role: $role(),
                content: prompt().trim(),
                images: promptImages(),
            },
        ]);
        prompt("");
        if ($role() !== "user") return;
        content("");
        promptImages([]);
        isGenerating(true);

        try {
            const message = await streamChat({
                model: $model(),
                messages: $responses().map(({ role, content }) => ({ role, content })),
                onChunk(chunk) {
                    content((current) => `${current}${chunk}`);
                    recent &&
                        window.scrollTo({
                            top: recent.offsetTop + recent.offsetHeight,
                        });
                },
            });
            message?.content?.trim() &&
                $responses((current) => [
                    ...current,
                    {
                        uuid: nanoid(20),
                        ...message,
                    },
                ]);
        } catch {}

        content(() => "");
        isGenerating(() => false);
        recent && window.scrollTo({ top: recent.offsetTop + recent.offsetHeight });
        inputRef?.focus();
    }

    const keyup = (e: KeyboardEvent) => {
        if (e.key === "Enter" && e.ctrlKey) {
            return onSubmit(e);
        }
    };

    return () => html`
        <div class=${tw`grid min-h-full grid-template-rows-[1fr,auto]`} style="grid-template-rows: 1fr auto;">
            <app-model-responses class="p-4">
                ${
                    content()
                        ? html`<app-model-response data-role="assistant" ref=${ref(
                              (x: HTMLElement) => {
                                  recent = x;
                                  return recent;
                              },
                          )}>
                    <zero-markdown content=${content()}></zero-markdown>
                </app-model-response>`
                        : null
                }
            </app-model-responses>
            <form class="flex flex-row gap-3 p-4 items-stretch bottom-0 left-0 right-0 sticky z-10 items-end border-t-1 border-t-black border-t-opacity-30 bg-[#121212]" @submit=${onSubmit}>
                <iron-autogrow-textarea type="text"
                    class="p-1 rounded w-full border-r-1 border-r-black border-r-opacity-30"
                    @input=${updatePrompt}
                    @keyup=${keyup}
                    .value=${prompt()}
                    max-rows="5"
                    ref=${ref((x: HTMLInputElement) => {
                        inputRef = x;
                        return inputRef;
                    })}
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
                    class=${tw(
                        "py-1 px-2 rounded text-white hover:bg-white hover:bg-opacity-5 disabled:(opacity-10 cursor-progress)",
                    )}
                    .disabled=${isGenerating()}>
                    <span>▶</span>
                </button>
            </form>
        </div>
    `;
}).as("app-chat");

interface MakiInputEvent<T> extends InputEvent {
    target: T & EventTarget;
}
