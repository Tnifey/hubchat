import { component, html, use } from "maki";
import { $modelOptions } from "./state";

component(($) => {
    const modelOptions = use($modelOptions);

    return () => html`
    <div class="flex flex-col gap-2">
        <app-form-field label="mirostat">
            <select value=${modelOptions().mirostat} @change=${(e) => modelOptions((opts) => ({ ...opts, mirostat: Number.parseInt(e.target.value) as 0 | 1 | 2 }))} class="p-2 rounded">
                <option value="0">0 - disabled</option>
                <option value="1">1 - mirostat</option>
                <option value="2">2 - mirostat 2.0</option>
            </select>
        </app-form-field>

        <app-form-field label="mirostat eta">
            <input
                class="p-2 rounded"
                type="number"
                value=${modelOptions().mirostat_eta}
                @change=${(e) => modelOptions((opts) => ({ ...opts, mirostat_eta: Number.parseFloat(e.target.value) as number }))}  />
        </app-form-field>

        <app-form-field label="mirostat tau">
            <input
                class="p-2 rounded"
                type="number"
                value=${modelOptions().mirostat_tau}
                @change=${(e) => modelOptions((opts) => ({ ...opts, mirostat_tau: Number.parseFloat(e.target.value) as number }))}  />
        </app-form-field>

        <app-form-field label="num ctx">
            <input
                class="p-2 rounded"
                type="number"
                value=${modelOptions().num_ctx}
                @change=${(e) => modelOptions((opts) => ({ ...opts, num_ctx: Number.parseInt(e.target.value, 10) as number }))}  />
        </app-form-field>

        <app-form-field label="repeat last n">
            <input
                class="p-2 rounded"
                type="number"
                value=${modelOptions().repeat_last_n}
                @change=${(e) => modelOptions((opts) => ({ ...opts, repeat_last_n: Number.parseInt(e.target.value, 10) as number }))}  />
        </app-form-field>

        <app-form-field label="repeat penalty">
            <input
                class="p-2 rounded"
                type="number"
                value=${modelOptions().repeat_penalty}
                @change=${(e) => modelOptions((opts) => ({ ...opts, repeat_penalty: Number.parseFloat(e.target.value) as number }))}  />
        </app-form-field>

        <app-form-field label="temperature">
            <input
                class="p-2 rounded"
                type="number"
                value=${modelOptions().temperature}
                @change=${(e) => modelOptions((opts) => ({ ...opts, temperature: Number.parseFloat(e.target.value) as number }))}  />
        </app-form-field>

        <app-form-field label="seed">
            <input
                class="p-2 rounded"
                type="number"
                value=${modelOptions().seed}
                @change=${(e) => modelOptions((opts) => ({ ...opts, seed: Number.parseInt(e.target.value, 10) as number }))}  />
        </app-form-field>

        <app-form-field label="tfs_z">
            <input
                class="p-2 rounded"
                type="number"
                value=${modelOptions().tfs_z}
                @change=${(e) => modelOptions((opts) => ({ ...opts, tfs_z: Number.parseFloat(e.target.value) as number }))}  />
        </app-form-field>

        <app-form-field label="num predict">
            <input
                class="p-2 rounded"
                type="number"
                value=${modelOptions().num_predict}
                @change=${(e) => modelOptions((opts) => ({ ...opts, num_predict: Number.parseInt(e.target.value, 10) as number }))}  />
        </app-form-field>

        <app-form-field label="top_k">
            <input
                class="p-2 rounded"
                type="number"
                value=${modelOptions().top_k}
                @change=${(e) => modelOptions((opts) => ({ ...opts, top_k: Number.parseInt(e.target.value, 10) as number }))}  />
        </app-form-field>

        <app-form-field label="top_p">
            <input
                class="p-2 rounded"
                type="number"
                value=${modelOptions().top_p}
                step="0.1"
                @change=${(e) => modelOptions((opts) => ({ ...opts, top_p: Number.parseFloat(e.target.value) as number }))}  />
        </app-form-field>
    </div>
    `;
}).as("app-model-settings");
