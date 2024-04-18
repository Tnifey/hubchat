import { isotope, persistentAtom } from "maki";

const defaultApi = "http://localhost:11434/api";

export const $api = isotope(defaultApi, (url) => {
    if (typeof url === 'string' && url.trim()) return url.replace(/\/$/, "");
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
