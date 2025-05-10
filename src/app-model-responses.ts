import { repeat } from "lit-html/directives/repeat.js";
import { component, html, tw, use } from "maki";
import "./markdown";
import { $responses } from "./state";

component(() => {
    const responses = use($responses);
    return () => html`
        <div class="flex flex-col gap-4 overflow-auto">
            ${repeat(
                responses(),
                (x) => x.uuid,
                (response) => html`
                <app-model-response data-role=${response.role} data-uuid=${response.uuid}>
                    <zero-markdown content=${response.content}></zero-markdown>
                </app-model-response>
            `,
            )}
            <slot></slot>
        </div>
    `;
}).as("app-model-responses");

component<{ "data-role": string }>(($) => {
    function remove() {
        const uuid = $.getAttribute("data-uuid");
        if (!uuid || !confirm("Are you sure you want to delete this response?")) return;
        $responses((responses) => responses.filter((x) => x.uuid !== uuid));
    }

    return ({ "data-role": role }) => {
        if (role === "system")
            return html`<div class="w-full text-sm text-center py-4 text-white text-opacity-60 relative">
            <slot></slot>
            <button type="button" class="p-1 px-2 text-xs absolute top-0 right-0 hover:bg-white hover:bg-opacity-5 leading-4 rounded-full" @click=${remove}>✖</button>
        </div>`;

        return html`
            <div class=${tw(
                "host:inline-block p-4 rounded-lg shadow max-w-prose bg-white w-[fit-content] relative",
                role === "user" ? "ml-auto bg-opacity-5 pr-8" : "bg-opacity-10 mr-auto pr-8",
            )}>
                <slot></slot>
                <button type="button" class="p-1 px-2 text-xs absolute top-0 right-0 hover:bg-white hover:bg-opacity-5 leading-4 rounded-full" @click=${remove}>✖</button>
            </div>
        `;
    };
}).as("app-model-response");
