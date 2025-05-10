import { isotope, persistentAtom } from "maki";

const defaultApi = "http://localhost:11434/api";

export const $api = isotope(defaultApi, (url) => {
    if (typeof url === "string" && url.trim()) return url.replace(/\/$/, "");
    return defaultApi;
});
export const $models = isotope<any[]>([]);
export const $model = isotope(persistentAtom("model", ""));
export const $role = isotope(persistentAtom("role", "user"));

fetch(`${$api()}/tags`)
    .then((response) => response.json())
    .then((data) => {
        if (!data || !Array.isArray(data?.models)) {
            throw new Error("No data or ollama is down");
        }
        $models(data?.models?.map(({ name }) => name));
    })
    .catch(console.log);

export const $responses = isotope(
    persistentAtom<
        {
            uuid: string;
            role: string;
            content: string;
        }[]
    >("generated-responses", []),
);

export type ModelOptions = {
    /**
     * Enable Mirostat sampling for controlling perplexity.
     * @type int
     * @example 0 // disabled
     * @example 1 // Mirostat
     * @example 2 // Mirostat 2.0
     * @default 0
     */
    mirostat?: 0 | 1 | 2;
    /**
     * Influences how quickly the algorithm responds to feedback from the generated text. A lower learning rate will result in slower adjustments, while a higher learning rate will make the algorithm more responsive.
     * @type float
     * @default 0.1
     */
    mirostat_eta?: number;
    /**
     * Controls the balance between coherence and diversity of the output. A lower value will result in more focused and coherent text.
     * @type float
     * @default 5.0
     */
    mirostat_tau?: number;
    /**
     * Sets the size of the context window used to generate the next token.
     * @type int
     * @default 2048
     */
    num_ctx?: number;
    /**
     * Sets how far back for the model to look back to prevent repetition.
     * @type int
     * @example 0 // disabled
     * @example -1 // num_ctx
     * @default 64
     */
    repeat_last_n?: number;
    /**
     * Sets how strongly to penalize repetitions.
     * A higher value (e.g., 1.5) will penalize repetitions more strongly,
     * while a lower value (e.g., 0.9) will be more lenient.
     * @type float
     * @default 1.1
     */
    repeat_penalty?: number;
    /**
     * The temperature of the model. Increasing the temperature will make the model answer more creatively.
     * @type float
     * @default 0.8
     */
    temperature?: number;
    /**
     * Sets the random number seed to use for generation.
     * Setting this to a specific number will make the model generate the same text for the same prompt.
     * @type int
     * @default 0
     */
    seed?: number;
    /**
     * Sets the stop sequences to use.
     * When this pattern is encountered the LLM will stop generating text and return.
     * Multiple stop patterns may be set by specifying multiple separate stop parameters in a modelfile.
     * @type string
     */
    stop?: string;
    /**
     * 	Tail free sampling is used to reduce the impact of less probable tokens from the output.
     * A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting.
     * @type float
     * @default 1
     */
    tfs_z?: number;
    /**
     * Maximum number of tokens to predict when generating text.
     * @type int
     * @example -1 // infinite generation
     * @example -2 // fill context
     * @default 128
     */
    num_predict?: number;
    /**
     * 	Reduces the probability of generating nonsense.
     * A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative.
     * @type int
     * @default 40
     */
    top_k?: number;
    /**
     * 	Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text,
     * while a lower value (e.g., 0.5) will generate more focused and conservative text.
     * @type float
     * @default 0.9
     */
    top_p?: number;
};

export const $modelOptions = isotope<ModelOptions>(
    persistentAtom("model-options", {
        mirostat: 0,
        mirostat_eta: 0.1,
        mirostat_tau: 5.0,
        num_ctx: 2048,
        repeat_last_n: 64,
        repeat_penalty: 1.1,
        temperature: 0.8,
        seed: 0,
        stop: undefined,
        tfs_z: 1,
        num_predict: 128,
        top_k: 40,
        top_p: 0.9,
    }),
);

export const $voices = isotope<SpeechSynthesisVoice[]>([]);
speechSynthesis.addEventListener("voiceschanged", () => {
    $voices(speechSynthesis.getVoices());
});

export const $voiceIndex = isotope(persistentAtom("voice-index", 0));
