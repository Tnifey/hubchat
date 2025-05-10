import { component, html, tw, use } from "maki";
import { $api } from "./state";

import "./app-model-settings";

component(() => {
    const isOpen = use(false);
    return () => html`
        <div class="relative inline-flex items-center justify-center h-full">
            <button type="button" class="p-2 leading-4 rounded-md hover:bg-white hover:bg-opacity-5" @click=${() => isOpen((x) => !x)}>
                ⚙
            </button>
            ${isOpen() ? html`<app-settings-modal @onclose=${() => isOpen(() => false)}></app-settings-modal>` : null}
        </div>
    `;
}).as("app-settings");

component(($) => {
    function onClose() {
        $.dispatchEvent(new CustomEvent("onclose", { bubbles: true }));
    }

    return () => html`
        <div class=${tw`absolute top-0 right-0 bg-black z-[99999] rounded-md min-w-[320px] max-h-[80dvh] border-solid border-1 border-white border-opacity-20 overflow-y-auto`}>
            <header class="flex gap-4 p-2 items-center border-b-solid border-b-1 border-white border-b-opacity-20 sticky top-0 left-0 right-0 bg-black">
                <h4 class="mr-auto px-2">
                    ⚙ Settings
                </h4>
                <button class="hover:bg-white hover:bg-opacity-5 p-2 leading-4 rounded-md"
                    @click=${onClose}
                    type="button">
                    ✖
                </button>
            </header>
            <div class="flex gap-2 flex-col px-4 pt-2 pb-6">
                <app-form-field label="ollama endpoint">
                    <app-text-input
                        placeholder="http://localhost:11434/api"
                        value=${$api()}
                        @change=${(e) => $api(() => e.target.value.trim())}></app-text-input>
                </app-form-field>
                <app-model-settings></app-model-settings>
            </div>
        </div>
    `;
}).as("app-settings-modal");
