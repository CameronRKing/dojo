import fs from '@/fs-client';
import CodeMirror from '@/components/CodeMirror.vue';
import HtmlEditor from '@/views/HtmlEditor.vue';
import JsEditor from '@/views/JsEditor.vue';
import MochaRunner from '@/components/testing/MochaRunner.vue';

window.fs = fs;
window.HtmlEditor = HtmlEditor;
window.JsEditor = JsEditor;
window.toMount = MochaRunner;
window.mt = async (cmp) => {
    if (typeof cmp == 'string') {
        toMount = await getCmp(cmp);
    } else {
        toMount = cmp;
    }
    root.$forceUpdate();
}

window.getCmp = async (cmp) => {
    return (await import(`../${cmp}`)).default;
}