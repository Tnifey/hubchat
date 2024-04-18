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
                <app-model-response data-role=${response.role}>
                    <zero-markdown content=${response.content}></zero-markdown>
                </app-model-response>
            `,
            )}
            <slot></slot>
        </div>
    `;
}).as("app-model-responses");

component<{ "data-role": string }>(() => {
    return ({ "data-role": role }) => {
        if (role === "system")
            return html`<div class="w-full text-sm text-center py-4 text-white text-opacity-60">
            <slot></slot>
        </div>`;

        return html`
            <div class=${tw(
                "host:inline-block p-4 rounded-lg shadow max-w-prose bg-white w-[fit-content]",
                role === "user" ? "ml-auto bg-opacity-5" : "bg-opacity-10 mr-auto",
            )}>
                <slot></slot>
            </div>
        `;
    };
}).as("app-model-response");
