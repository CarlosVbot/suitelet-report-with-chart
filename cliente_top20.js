/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(["N/currentRecord", "N/https", "N/ui/message", "N/url"], function(
    currentRecord,
    https,
    message,
    url
) {
    function pageInit(scriptContext) {}

    function generar() {
        try {
            var records = currentRecord.get();
            var year = records.getValue({
                fieldId: "custom_select_year"
            });
            var suiteletURL = url.resolveScript({
                scriptId: "customscriptsm_reporte_top_20",
                deploymentId: "customdeploysm_reporte_top_20",
                returnExternalUrl: false,
                params: {
                    year: year
                }
            });
            location.replace(suiteletURL);
        } catch (e) {
            console.log(e);
            message
                .create({
                    type: message.Type.ERROR,
                    title: "Error",
                    message: response.message
                })
                .show({ duration: 10000 });
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        generar: generar
    };
});
