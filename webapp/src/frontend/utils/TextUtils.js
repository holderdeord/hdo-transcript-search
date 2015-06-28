import React from 'react';

export default class TextUtils {
    static paragraphsFrom(speech) {
        let text = speech.highlight ? speech.highlight.text.join('\n') : speech.text;

        return text.split("\n").map((fragment, i) => {
            fragment = fragment.replace(/<\/mark>(\s*)<mark>/g, '$1');

            return (<p key={i} dangerouslySetInnerHTML={{__html: fragment}}></p>);
        });
    }

    static teaser(speech) {
        return speech.text.split("\n")[0];
    }
}