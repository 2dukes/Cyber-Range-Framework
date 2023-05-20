# feupteses

## Estilo LaTeX para dissertações na FEUP

a) Usar "pdflatex" e não "latex".

b) O ficheiro principal é "tese.tex". Leia as instruções aí contidas.
Para a versão em inglês use "thesis.tex".

c) O estilo está definido em "feupteses.sty".

d) Para criar o exemplo use a Makefile ou então:

```
pdflatex tese
bibtex tese
pdflatex tese
pdflatex tese
```

   O ficheiro "tese.pdf" contém o resultado.

e) O ficheiro "plainnat-pt.bst" é necessário para processar
   referências no formato (autor,data) em Português. Em Inglês, use
   "plainnat.bst". 

   O ficheiro "alpha-pt.bst" é necessário para empregar referências
   alfabéticas.

f) O conjunto de caracteres usado na ferramenta de edição deve ser reportado 
   através da opção adequada: 

   `\usepackage[latin1]{inputenc}`

   OU

   `\usepackage[utf8]{inputenc}`

   Para MAC (codificação nativa, não UTF-8)

   `\usepackage[applemac]{inputenc}`

g) Na distribuição MiKTeX para ter hifenização correta deverá
   selecionar a linguagem Português em 
   "Start-> Programs-> MiKTeX 2-> MiKTeX Option".

h) Figuras: 

h1) pdf(la)tex  suporta os formatos png, jpeg, tiff e pdf. 

Também podem ser usados os ficheiros produzidos por Metapost (que são
escritos numa versão simplificada de Postscript).

Para converter figuras de eps (Encapsulated Postscript) para pdf pode
usar o programa epstopdf.

Para retirar espaço existente em torno de figuras pdf, pode usar
pdfcrop.

h2) Para usar as mesmas figuras (em eps) com pdflatex e latex, bem como
usar figuras criadas com o pacote "pstricks", use o pacote
"pst-pdf.sty" (Só se justifica em casos muito especiais!)

j) A automatização das chamadas a latex, bibtex, etc. pode ser feita
   através do programa auxiliar latexmk, disponível em MikTeX e
   TeXlive. (http://ctan.org/pkg/latexmk/)


JCL & JCF, 2021-09-13
