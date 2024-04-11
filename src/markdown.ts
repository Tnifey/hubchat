import { component, html } from "maki";
import "zero-md";

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
