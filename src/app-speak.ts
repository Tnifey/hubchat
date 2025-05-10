import { repeat } from "lit-html/directives/repeat.js";
import { component, html, tw, use } from "maki";
import { $voiceIndex, $voices } from "./state";

export function speak(text: string, voice: SpeechSynthesisVoice) {
    if (!window.speechSynthesis) return console.warn("speech synthesis not supported");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    speechSynthesis.speak(utterance);
    utterance.pitch = 0.4;
    return utterance;
}

component(() => {
    const text = use("something to say");
    const voices = use($voices);
    const voiceIndex = use($voiceIndex);

    function changeVoice(voiceIndex: number) {
        $voiceIndex(voiceIndex);
    }

    return () => html`
        <select value=${voiceIndex()} @change=${(e) => changeVoice(e.target.value)} class=${tw`max-w-[280px]`}>
            ${repeat(
                voices(),
                (x) => x.name,
                (voice, i) => html`
                <option value=${i}>${voice.name}</option>
            `,
            )}
        </select>

        <button type="button" @click=${() => speak(text(), voices()[voiceIndex()])}>
            speak
        </button>
    `;
}).as("app-speak");
