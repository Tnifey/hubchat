import { component, html } from "maki";

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
