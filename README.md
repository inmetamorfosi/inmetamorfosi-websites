# inMetamorfosi Websites · pagina per i clienti

Pagina che i commerciali usano sul tablet durante le visite (e che si può mandare al cliente): presenta i siti su misura di inMetamorfosi, gli esempi, come funziona, i prezzi e le domande frequenti. Nessun riferimento al programma partner.

Sito statico: niente framework né build, si apre `index.html` e basta.

## Struttura

```
inMetamorfosi websites/
├── index.html      la pagina principale, continua, con la barra delle sezioni
├── dettagli.html   la versione lunga con tutti i dettagli, da leggere con calma
├── css/sito.css    grafica di index.html (palette di inmetamorfosi.com in cima, nelle variabili :root)
├── css/style.css   grafica di dettagli.html
├── js/sito.js      ricerca animata, esempi a tutto schermo, preventivo, domande, pannello del venditore
├── js/main.js      script di dettagli.html
├── media/          logo, anteprima per i link condivisi, anteprime degli esempi
└── esempi/         i 6 siti dimostrativi (generati da build_esempi.py, vedi sotto)
```

## Cose utili da sapere

- **Colori**: solo quelli di inmetamorfosi.com (Porcelain #FDFBF4, Carbon #1D1D1B, Coral #E9472A, Amber Gold #FDBF2D, Sapphire Sky #1870CF). Sono in cima a `css/sito.css`.
- **Esempi**: la griglia apre il sito a tutto schermo, con i pulsanti Computer / Telefono e i pallini "cosa c'è dentro" (verde incluso, arancione modulo extra, blu pagina in più). Link diretto a un esempio già aperto: `?apri=ceramiche` oppure `?apri=ceramiche&vista=mobile`.
- **Pannello del venditore**: il pulsante "Personalizza" nel footer apre il pannello per scrivere nome, settore e città del cliente; la ricerca in apertura e l'esempio simile si adattano. Si può anche aprire la pagina con `?nome=…&settore=…&citta=…`.
- **Prezzi**: sono scritti in `index.html` (formati e moduli) e calcolati in `js/sito.js` (oggetto `PRICE`). Se cambia il listino, vanno aggiornati in entrambi i punti, e anche in `dettagli.html`.
- **Siti dimostrativi**: si rigenerano con `python3 build_esempi.py clienti` dalla cartella `Pronto Online 2.0/Esempi/` (fuori da questo repository).
- **Modulo contatti**: apre WhatsApp o l'email con il messaggio già scritto, nessun dato passa da un server.

## Pubblicazione

1. Creare lo zip della cartella (senza `.git`, `README.md`, `.gitignore`).
2. Caricarlo su Astra e scompattarlo nella cartella `/websites/` del sito.
3. L'indirizzo `https://inmetamorfosi.com/websites/` è scritto in `index.html` (canonical, anteprima dei link): se la cartella cambia, aggiornarlo.
