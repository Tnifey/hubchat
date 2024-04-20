import { component, html, use } from "maki";

component(() => {
    const voices = use([]);

    function speak() {
        voices(speechSynthesis.getVoices());

        const utterance = new SpeechSynthesisUtterance("Welcome to this tutorial!");
        utterance.voice = voices()[4];
        speechSynthesis.speak(utterance);
    }

    return () => html`
        <button type="button" @click=${speak}>speak</button>
    `;
}).as('app-speak');
