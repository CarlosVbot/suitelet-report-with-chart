/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(
    ["N/https", "N/record", "N/search", "N/currency", "N/ui/serverWidget"],
    (https, record, search, currency, serverWidget) => {
        const onRequest = scriptContext => {
            if (!scriptContext.request.parameters.year) {
                var array_years = generarArrayAnnosPasados();
                var form = serverWidget.createForm({
                    title: "Seleccione el año"
                });

                var selectField = form.addField({
                    id: "custom_select_year",
                    type: serverWidget.FieldType.SELECT,
                    label: "Año"
                });
                for (let i = 0; i < array_years.length; i++) {
                    selectField.addSelectOption({
                        value: array_years[i],
                        text: array_years[i]
                    });
                }
                form.clientScriptModulePath = "./cliente_top20.js";
                form.addButton({
                    id: "custom_select",
                    label: "Generar Reporte",
                    functionName: "generar()"
                });
                scriptContext.response.writePage(form);
            } else {
                try {
                    var select_year = scriptContext.request.parameters.year;
                    log.debug("select_year", select_year);
                    var data = busqueda_data(select_year);
                    var data_ordnance = ordenar_mes(data);
                    var data_week = ordenar_semanas(data);
                    var page = generar_pagina(
                        data_ordnance.arreglo_final,
                        data_week,
                        data_ordnance.totales
                    );
                    scriptContext.response.write(page);
                } catch (e) {
                    var error_page = generar_pagina_error(e);
                    log.error("error_page", error_page);
                }
            }
        };
        function generar_pagina(data_ordenada, data_ordenada_week, totales) {
            try {
                var data_1 = data_ordenada;
                var data_2 = JSON.stringify(data_1);
                var data_1_week = data_ordenada_week;
                var data_2_week = JSON.stringify(data_1_week);
                var tabla_relleno = "";

                for (var i = 0; i < data_1.length; i++) {
                    log.debug("data_1[i]", data_1[i]);
                    var porcentajes = {
                        enero: data_1[i].data[0] / totales[0].monto * 100,
                        febrero: data_1[i].data[1] / totales[1].monto * 100,
                        marzo: data_1[i].data[2] / totales[2].monto * 100,
                        abril: data_1[i].data[3] / totales[3].monto * 100,
                        mayo: data_1[i].data[4] / totales[4].monto * 100,
                        junio: data_1[i].data[5] / totales[5].monto * 100,
                        julio: data_1[i].data[6] / totales[6].monto * 100,
                        agosto: data_1[i].data[7] / totales[7].monto * 100,
                        septiembre: data_1[i].data[8] / totales[8].monto * 100,
                        octubre: data_1[i].data[9] / totales[9].monto * 100,
                        noviembre: data_1[i].data[10] / totales[10].monto * 100,
                        diciembre: data_1[i].data[11] / totales[11].monto * 100
                    };
                    tabla_relleno += `
                    <tr>
                        <td>${data_1[i].label}</td>
                        <td> ${porcentajes.enero.toFixed(2)}%</td>
                        <td> ${porcentajes.febrero.toFixed(2)}%</td>
                        <td> ${porcentajes.marzo.toFixed(2)}%</td>
                        <td> ${porcentajes.abril.toFixed(2)}%</td>
                        <td> ${porcentajes.mayo.toFixed(2)}%</td>
                        <td> ${porcentajes.junio.toFixed(2)}%</td>
                        <td> ${porcentajes.julio.toFixed(2)}%</td>
                        <td> ${porcentajes.agosto.toFixed(2)}%</td>
                        <td> ${porcentajes.septiembre.toFixed(2)}%</td>
                        <td> ${porcentajes.octubre.toFixed(2)}%</td>
                        <td> ${porcentajes.noviembre.toFixed(2)}%</td>
                        <td> ${porcentajes.diciembre.toFixed(2)}%</td>
                    </tr>
                       
                    `;
                }

                var total_mensual_renglon = `
                    <tr>
                        <td>Total de venta por mes</td>
                        <td>$ ${totales[0].monto.toFixed(2)}</td>
                        <td>$ ${totales[1].monto.toFixed(2)}</td>
                        <td>$ ${totales[2].monto.toFixed(2)}</td>
                        <td>$ ${totales[3].monto.toFixed(2)}</td>
                        <td>$ ${totales[4].monto.toFixed(2)}</td>
                        <td>$ ${totales[5].monto.toFixed(2)}</td>
                        <td>$ ${totales[6].monto.toFixed(2)}</td>
                        <td>$ ${totales[7].monto.toFixed(2)}</td>
                        <td>$ ${totales[8].monto.toFixed(2)}</td>
                        <td>$ ${totales[9].monto.toFixed(2)}</td>
                        <td>$ ${totales[10].monto.toFixed(2)}</td>
                        <td>$ ${totales[11].monto.toFixed(2)}</td>
                    </tr>
                       
                    `;

                var tabla = `
                 <table >
                 <tr>
                    <th>Cliente</th>
                     <th>Enero</th>
                        <th>Febrero</th>
                        <th>Marzo</th>
                        <th>Abril</th>
                        <th>Mayo</th>
                        <th>Junio</th>
                        <th>Julio</th>
                        <th>Agosto</th>
                        <th>Septiembre</th>
                        <th>Octubre</th>
                        <th>Noviembre</th>
                        <th>Diciembre</th>
                        
                </tr>
                                 ${tabla_relleno}
                                 ${total_mensual_renglon}
                                </table>
                `;

                var page = `
                    <!DOCTYPE html>
                        <html lang="es">
                        <head>
                            <meta charset="UTF-8">
                            <title>Gráfico de Ventas por Cliente</title>
                            <style>
                             body {
                                  font-family: Arial, sans-serif;
                                }
                            
                                .tabs {
                                  display: flex;
                                  margin-bottom: 10px;
                                }
                            
                                .tab {
                                  padding: 10px;
                                  cursor: pointer;
                                  border: 1px solid #ccc;
                                  border-radius: 5px 5px 0 0;
                                  background-color: #f0f0f0;
                                }
                            
                                .tab.active {
                                  background-color: #fff;
                                }
                            
                                .content {
                                  display: none;
                                  border: 1px solid #ccc;
                                  padding: 15px;
                                  border-radius: 0 0 5px 5px;
                                }
                            
                                .content.active {
                                  display: block;
                                }
                                
                                .left {
                                  flex: 1;
                                  padding: 20px;
                                }
                            
                                .right {
                                  flex: 1;
                                  padding: 20px;
                                }
                            
                                h2 {
                                  margin-bottom: 10px;
                                }
                            
                                table {
                                  width: 100%;
                                  border-collapse: collapse;
                                  margin-top: 10px;
                                }
                            
                                th, td {
                                  padding: 10px;
                                  text-align: left;
                                  border: 1px solid #ddd;
                                }
                            
                                th {
                                  background-color: #f2f2f2;
                                }
                            </style>
                            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                        </head>
                        <body>
                        
                          <div class="tabs">
                            <div class="tab" onclick="changeTab('tab1')">Reporte grafico</div>
                            <div class="tab" onclick="changeTab('tab2')">Tabla de comparación</div>
                          </div>
                        
                           
                            <div id="tab1" class="content active" >
                             <canvas id="graficaVentas"></canvas>
                                <label for="tipoIntervalo">Seleccione el intervalo:</label>
                                <select id="tipoIntervalo">
                                    <option value="mensual">Mensual</option>
                                    <option value="semanal">Semanal</option>
                                </select>
                            </div>
                            <div id="tab2" class="content">
                                <h2>Comparación de ventas por porcentaje</h2>
                                ${tabla}
                              </div>
                                <script>
                                    var ctx = document.getElementById('graficaVentas').getContext('2d');
                                       console.log(${data_2})
                                    var datos = {
                                        labels: ['Enero', 'Febrero', 'Marzo', 'Abril',  'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                                          datasets: ${data_2}
                                
                                    };
                            
                                    var datos2 = {
                                        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4',  'Semana 5', 'Semana 6', 'Semana 7', 'Semana 8', 'Semana 9', 'Semana 10', 'Semana 11', 'Semana 12', 'Semana 13', 'Semana 14', 'Semana 15', 'Semana 16', 'Semana 17', 'Semana 18', 'Semana 19', 'Semana 20', 'Semana 21', 'Semana 22', 'Semana 23', 'Semana 24', 'Semana 25', 'Semana 26', 'Semana 27', 'Semana 28', 'Semana 29', 'Semana 30', 'Semana 31', 'Semana 32', 'Semana 33', 'Semana 34', 'Semana 35', 'Semana 36', 'Semana 37', 'Semana 38', 'Semana 39', 'Semana 40', 'Semana 41', 'Semana 42', 'Semana 43', 'Semana 44', 'Semana 45', 'Semana 46', 'Semana 47', 'Semana 48', 'Semana 49', 'Semana 50', 'Semana 51', 'Semana 52'],
                                          datasets: ${data_2_week}
                                    };
                            
                                    var opciones = {
                                        responsive: true,
                                        scales: {
                                            x: {
                                                stacked: true 
                                            },
                                            y: {
                                                stacked: true 
                                            }
                                        }
                                    };
                            
                                    var grafica = new Chart(ctx, {
                                        type: 'bar',
                                        data: datos,
                                        options: opciones
                                    });
                            
                                    var tipoIntervaloSelect = document.getElementById('tipoIntervalo');
                                    tipoIntervaloSelect.addEventListener('change', function () {
                                        var valorSeleccionado = tipoIntervaloSelect.value;
                            
                                        if (valorSeleccionado === 'semanal') {
                                            grafica.destroy();
                                            grafica = new Chart(ctx, {
                                                type: 'bar',
                                                data: datos2,
                                                options: opciones
                                            });
                                        } else if (valorSeleccionado === 'mensual') {
                                            grafica.destroy();
                                            grafica = new Chart(ctx, {
                                                type: 'bar',
                                                data: datos,
                                                options: opciones
                                            });
                                        }
                                    });
                                      function changeTab(tabId) {
                                      document.querySelectorAll('.content').forEach(function(content) {
                                        content.classList.remove('active');
                                      });
                                
                                      document.querySelectorAll('.tab').forEach(function(tab) {
                                        tab.classList.remove('active');
                                      });
                                
                                      document.getElementById(tabId).classList.add('active');
                                      document.querySelector('[onclick="changeTab(\\'' + tabId + '\\')"]').classList.add('active');
    }
                                </script>
                            </body>
                        </html>
                `;
                return page;
            } catch (e) {
                log.error("generar_pagina", e);
            }
        }

        function busqueda_data(select_year) {
            try {
                var dias_rango = obtenerPrimerUltimoDiaAño(select_year);
                log.debug("dias_rango", dias_rango);
                var meses = [
                    "Enero",
                    "Febrero",
                    "Marzo",
                    "Abril",
                    "Mayo",
                    "Junio",
                    "Julio",
                    "Agosto",
                    "Septiembre",
                    "Octubre",
                    "Noviembre",
                    "Diciembre"
                ];
                var salesorderSearchObj = search.create({
                    type: "salesorder",
                    filters: [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        [
                            "status",
                            "anyof",
                            "SalesOrd:A",
                            "SalesOrd:B",
                            "SalesOrd:D",
                            "SalesOrd:E",
                            "SalesOrd:F",
                            "SalesOrd:G",
                            "SalesOrd:H"
                        ],
                        "AND",
                        ["trandate", "within", dias_rango.primerDia, dias_rango.ultimoDia],
                        "AND",
                        [
                            "customermain.internalid",
                            "noneof",
                            "4947",
                            "6204",
                            "1914",
                            "1913",
                            "6403",
                            "4946"
                        ],
                        "AND",
                        ["custtype", "noneof", "5"]
                    ],
                    columns: [
                        "internalid",
                        "amount",
                        "fxamount",
                        search.createColumn({
                            name: "companyname",
                            join: "customerMain"
                        }),
                        "trandate",
                        "currency"
                    ]
                });
                var myResults = getAllResults(salesorderSearchObj);
                var top20 = {};
                var respuesta = [];
                var tipo_cambio = currency.exchangeRate({
                    source: "MXN",
                    target: "USD"
                });
                var monto_total = 0;
                myResults.forEach(function(result) {
                    var tranDate = result.getValue({ name: "trandate" });
                    var splitDate = tranDate.split("/");
                    var month = meses[parseInt(splitDate[1]) - 1];
                    var currency_tr = result.getValue({ name: "currency" });
                    var cambio = 1;

                    if (currency_tr == 5) {
                        cambio = tipo_cambio;
                        var monto = parseFloat(result.getValue({ name: "amount" }));
                    } else {
                        var monto = parseFloat(result.getValue({ name: "fxamount" }));
                    }
                    monto_total += parseFloat(monto);
                    respuesta.push({
                        internalid: result.getValue({ name: "internalid" }),
                        companyname: result.getValue({
                            name: "companyname",
                            join: "customerMain"
                        }),
                        fxamount: monto * cambio,
                        month: month,
                        week: obtenerSemana(tranDate)
                    });
                    var companyname = result.getValue({
                        name: "companyname",
                        join: "customerMain"
                    });
                    var fxamount_cambio = monto * cambio;
                    if (!top20[companyname]) {
                        top20[companyname] = {
                            fxamount: fxamount_cambio
                        };
                    } else {
                        top20[companyname].fxamount += fxamount_cambio;
                    }
                });

                var top_20_arr = obtener_top_20(top20);

                log.debug("respuesta", respuesta);
                return {
                    respuesta: respuesta,
                    top_20_arr: top_20_arr,
                    monto_total: monto_total
                };
            } catch (e) {
                log.error("busqueda_data", e);
            }
        }

        function ordenar_mes(data_all) {
            try {
                var data = data_all.respuesta;
                var top_20_arr = data_all.top_20_arr;
                var meses = [
                    "Enero",
                    "Febrero",
                    "Marzo",
                    "Abril",
                    "Mayo",
                    "Junio",
                    "Julio",
                    "Agosto",
                    "Septiembre",
                    "Octubre",
                    "Noviembre",
                    "Diciembre"
                ];

                const sumas = {};
                var array_res = [];
                data.forEach(item => {
                    const key = `${item.companyname}-${item.month}`;
                    for (let i = 0; i < top_20_arr.length; i++) {
                        if (item.companyname === top_20_arr[i]) {
                            if (!sumas[key]) {
                                sumas[key] = {
                                    monto: parseFloat(item.fxamount),
                                    mes: item.month,
                                    companyname: item.companyname
                                };
                            } else {
                                var monto_temp = sumas[key];
                                sumas[key] = {
                                    monto:
                                        parseFloat(monto_temp.monto) + parseFloat(item.fxamount),
                                    mes: item.month,
                                    companyname: item.companyname
                                };
                            }
                        }
                    }
                });

                for (let clave in sumas) {
                    array_res.push({
                        companyname: sumas[clave].companyname,
                        monto: sumas[clave].monto,
                        mes: sumas[clave].mes
                    });
                }

                var total_mensual = 0;
                var totales = [];
                for (var i = 0; i < meses.length; i++) {
                    for (var j = 0; j < array_res.length; j++) {
                        if (meses[i] === array_res[j].mes) {
                            total_mensual += array_res[j].monto;
                        }
                    }
                    totales.push({
                        mes: meses[i],
                        monto: total_mensual
                    });
                }
                log.debug(">>>totales", totales);
                var objresultado = {};
                for (var i = 0; i < meses.length; i++) {
                    for (var j = 0; j < array_res.length; j++) {
                        var nombre = array_res[j].companyname;
                        if (meses[i] === array_res[j].mes) {
                            if (!objresultado[nombre]) {
                                var temporal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                                temporal[i] = array_res[j].monto;
                                objresultado[nombre] = {
                                    data: temporal
                                };
                            } else {
                                var data_temp = objresultado[nombre].data;
                                data_temp[i] = array_res[j].monto;
                                objresultado[nombre] = {
                                    data: data_temp
                                };
                            }
                        }
                    }
                }

                var arreglo_final = [];
                for (let key in objresultado) {
                    arreglo_final.push({
                        label: key,
                        data: objresultado[key].data,
                        backgroundColor: generarColorAleatorio(),
                        borderWidth: 1
                    });
                }
                log.debug("arreglo_final", arreglo_final);
                return {
                    arreglo_final: arreglo_final,
                    totales: totales
                };
            } catch (e) {
                log.error("ordenar_mes", e);
            }
        }

        function ordenar_semanas(data_all) {
            try {
                var data = data_all.respuesta;
                var top_20_arr = data_all.top_20_arr;
                var semana = [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25,
                    26,
                    27,
                    28,
                    29,
                    30,
                    31,
                    32,
                    33,
                    34,
                    35,
                    36,
                    37,
                    38,
                    39,
                    40,
                    41,
                    42,
                    43,
                    44,
                    45,
                    46,
                    47,
                    48,
                    49,
                    50,
                    51,
                    52,
                    53
                ];

                const sumas = {};
                var array_res = [];
                data.forEach(item => {
                    const key = `${item.companyname}-${item.week}`;
                    for (let i = 0; i < top_20_arr.length; i++) {
                        if (item.companyname === top_20_arr[i]) {
                            if (!sumas[key]) {
                                sumas[key] = {
                                    monto: parseFloat(item.fxamount),
                                    week: item.week,
                                    companyname: item.companyname
                                };
                            } else {
                                var monto_temp = sumas[key];
                                sumas[key] = {
                                    monto:
                                        parseFloat(monto_temp.monto) + parseFloat(item.fxamount),
                                    week: item.week,
                                    companyname: item.companyname
                                };
                            }
                        }
                    }
                });

                for (let clave in sumas) {
                    array_res.push({
                        companyname: sumas[clave].companyname,
                        monto: sumas[clave].monto,
                        week: sumas[clave].week
                    });
                }

                var objresultado = {};
                for (var i = 0; i < array_res.length; i++) {
                    for (var j = 0; j < semana.length; j++) {
                        var nombre = array_res[i].companyname;
                        if (semana[j] === array_res[i].week) {
                            var array__temp = Array(53).fill(0);
                            array__temp[array_res[i].week - 1] = array_res[i].monto;
                            if (!objresultado[nombre]) {
                                objresultado[nombre] = {
                                    data: array__temp
                                };
                            } else {
                                var data_temp = objresultado[nombre].data;
                                data_temp[array_res[i].week - 1] = array_res[i].monto;
                                objresultado[nombre] = {
                                    data: data_temp
                                };
                            }
                        }
                    }
                }

                var arreglo_final = [];
                for (let key in objresultado) {
                    arreglo_final.push({
                        label: key,
                        data: objresultado[key].data,
                        backgroundColor: generarColorAleatorio(),
                        borderWidth: 1
                    });
                }
                //  log.debug(">>>arreglo_final week", arreglo_final);
                return arreglo_final;
            } catch (e) {
                log.error("ordenar_semanas", e);
            }
        }

        function getAllResults(s) {
            var results = s.run();
            var searchResults = [];
            var searchid = 0;
            do {
                var resultslice = results.getRange({
                    start: searchid,
                    end: searchid + 1000
                });
                resultslice.forEach(function(slice) {
                    searchResults.push(slice);
                    searchid++;
                });
            } while (resultslice.length >= 1000);
            return searchResults;
        }

        function generarColorAleatorio() {
            const red = Math.floor(Math.random() * 256);
            const green = Math.floor(Math.random() * 256);
            const blue = Math.floor(Math.random() * 256);
            const opacity = 10;

            const color = `rgba(${red}, ${green}, ${blue}, ${opacity})`;

            return color;
        }

        function obtenerSemana(fecha) {
            try {
                var fecha_str = fecha.split("/");
                var fecha_format =
                    fecha_str[1] + "/" + fecha_str[0] + "/" + fecha_str[2];

                const currentDate = new Date(fecha_format);

                const currentYear = currentDate.getFullYear();

                const firstDayOfYear = new Date(currentYear, 0, 1);

                const differenceInMilliseconds = currentDate - firstDayOfYear;

                const weekNumber =
                    Math.floor(differenceInMilliseconds / (7 * 24 * 60 * 60 * 1000)) + 1;

                return weekNumber;
            } catch (e) {
                log.error("obtenerSemana", e);
            }
        }

        function generar_pagina_error(error) {
            try {
                var page = `
                <!DOCTYPE html>
                    <html lang="es">
                    <head>
                      <meta charset="UTF-8">
                      <title>¡Error!</title>
                      <style>
                        body {
                          font-family: Arial, sans-serif;
                          background-color: #f7f7f7;
                          margin: 0;
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          height: 100vh;
                        }
                        .error-container {
                          text-align: center;
                          background-color: #ffffff;
                          padding: 40px;
                          border-radius: 8px;
                          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                          color: #ff4444;
                        }
                        p {
                          color: #333333;
                          font-size: 18px;
                          margin-top: 20px;
                        }
                        .back-link {
                          margin-top: 20px;
                          text-decoration: none;
                          color: #007bff;
                          display: inline-block;
                          border-bottom: 1px solid transparent;
                          transition: border-color 0.3s ease-in-out;
                        }
                        .back-link:hover {
                          border-color: #007bff;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="error-container">
                        <h1>¡Error!</h1>
                        <p>Codigo de error: ${error.message}</p>
                      </div>
                    </body>
                    </html>
                `;
                return page;
            } catch (e) {
                log.error("generar_pagina_error", e);
            }
        }

        function obtener_top_20(data) {
            try {
                const clientesArray = Object.entries(data);

                clientesArray.sort((a, b) => b[1].fxamount - a[1].fxamount);

                const top20Clientes = clientesArray.slice(0, 20);
                var respuesta = [];
                for (let i = 0; i < top20Clientes.length; i++) {
                    respuesta.push(top20Clientes[i][0]);
                }
                return respuesta;
            } catch (e) {
                log.error("obtener_top_20", e);
            }
        }

        function generarArrayAnnosPasados() {
            const añoActual = new Date().getFullYear();
            const añoFinal = 2023;

            const añosPasados = [];
            for (let año = añoActual; año >= añoFinal; año--) {
                añosPasados.push(año);
            }

            return añosPasados;
        }

        function obtenerPrimerUltimoDiaAño(year) {
            const primerDia = "01/01/" + year;

            const ultimoDia = "31/12/" + year;

            return { primerDia: primerDia, ultimoDia: ultimoDia };
        }

        return { onRequest };
    }
);