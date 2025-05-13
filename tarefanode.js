/**
 
 1. Crie uma apliação em NodeJS que faça o seguinte:

 - Peça o caminho de um arquivo txt do seu computador;
 - Leia o arquivo;
 - Conte quantas linhas possuem somente números e some os números destas linhas;
 - Conte quantas linhas possuem texto;

  2. Exiba um resumo com:

   - Soma dos números dentro deste arquivo;
   - Quantas linhas continham texto (se tiver texto e número na mesma linha deverá contar aqui);
   - Quanto tempo demorou a execução;

  3. O resumo deverá ser disparado por EVENTO:

  - A leitura do arquivo deverá ser feita de forma assíncrona;
  - Pergunte se deseja executar novamente.

 */

const readline = require("readline").createInterface({

    input: process.stdin,
    output: process.stdout

})

const fs = require("fs").promises;

const EventEmmiter = require("events");

class ProcessadorArquivo extends EventEmmiter {
    constructor() {
        super();
        this.somaNumeros = 0;
        this.linhasComTexto = 0;
        this.tempoInicio = 0;
        this.tempoFim = 0;
    }
    async processarArquivo(caminhoArquivo) {
        this.tempoInicio = Date.now();
        this.somaNumeros = 0;
        this.linhasComTexto = 0;
        this.tempoFim = 0;

        try {
            const data = await fs.readFile(caminhoArquivo, "utf-8");
            const linhas = data.split("\n");

            for (const linha of linhas) {
                const apenasNumeros = /^[0-9]+$/.test(linha.replaceAll(" ", "").trim());
                const contemTexto = /[a-zA-z]/.test(linha);

                if (apenasNumeros) {
                    this.somaNumeros += parseInt(linha.trim());
                }

                if (contemTexto) {
                    this.linhasComTexto++;
                }

            }

            this.tempoFim = Date.now();

            const tempoExecucao = this.tempoFim - this.tempoInicio;

            const resumoObjeto = {
                soma: this.somaNumeros,
                linhasTexto: this.linhasComTexto,
                tempoExecucao,
                nomeArquivo: caminhoArquivo
            };
            this.emit("resumoEvento", resumoObjeto);
        }
        catch (error) {

            console.error("Erro ao ler arquivo: ", error);
            this.emit("erro", error.message);
        }
    };
};

async function main() {
    const processador = new ProcessadorArquivo();

    processador.on("resumoEvento", (resumoObjeto) => {
        console.log(resumoObjeto)
        console.log(`\n----> Exibindo dados do arquivo: '${resumoObjeto.nomeArquivo}`);

        console.table(
            [
                ["Soma dos números", resumoObjeto.soma],
                ["Linhas com texto", resumoObjeto.linhasTexto],
                ["Tempo de execução", resumoObjeto.tempoExecucao],
            ]
        );
    });

    processador.on("erro", (mensagemErro) => {
        console.error("Erro", mensagemErro);
    });

    async function perguntarNovoAquivo() {
        readline.question("\nDigite o caminho do arquivo: ", async (caminho) => {
            await processador.processarArquivo(caminho);
            function loop() {
                readline.question("\nDeseja executar novamente ? [S/N]", (resposta) => {
                    const respostaTratada = resposta.toLowerCase().charAt(0);
                    if (respostaTratada === "s") {
                        perguntarNovoAquivo();


                    }
                    else if (respostaTratada === "n") {
                        console.log("Encerrando a aplicação...")
                        readline.close();
                    }
                    else {
                        console.log("Responda somente [S/N]");
                    }
                });
            };

            loop();
        });
    };

    perguntarNovoAquivo();
};

main();