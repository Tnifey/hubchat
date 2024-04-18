import { component, html, tw, use } from "maki";
import { $api } from "./state";

import "./app-select-model";
import "./app-select-role";

component(() => {
    const isOpen = use(true);
    return () => html`
        <div class="relative inline-flex items-center justify-center h-full">
            <button type="button" class="p-2 leading-4 rounded-md hover:bg-white hover:bg-opacity-5" @click=${() => isOpen(x => !x)}>
                ⚙
            </button>
            ${isOpen() ? html`<app-settings-modal @onclose=${() => isOpen(() => false)}></app-settings-modal>` : null}
        </div>
    `;
}).as('app-settings');

component(($) => {
    function onClose() {
        $.dispatchEvent(new CustomEvent('onclose', { bubbles: true }));
    }

    return () => html`
        <div class=${tw`absolute top-0 right-0 bg-black z-[99999] rounded-md min-w-[320px] border-solid border-1 border-white border-opacity-20`}>
            <header class="flex gap-4 p-2 items-center border-b-solid border-b-1 border-white border-b-opacity-20">
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
                        @change=${console.log}></app-text-input>
                </app-form-field>
                <app-form-field label="model">
                    <app-select-model></app-select-model>
                </app-form-field>
                <app-form-field label="role">
                    <app-select-role></app-select-role>
                </app-form-field>
            </div>
        </div>
    `;
}).as('app-settings-modal');

component(($) => {
    return () => html`
        <input type="text"
            class="p-2 rounded w-full border-r-1 border-r-black border-r-opacity-30"
            placeholder=${$.getAttribute('placeholder')}
            value=${$.getAttribute('value')}
        />
    `;
}).as('app-text-input');

component($ => {
    return () => html`
        <label class="text-xs flex flex-col gap-1">
            <span>${$.getAttribute('label')}</span>
            <slot></slot>
        </label>
    `;
}).as('app-form-field');
