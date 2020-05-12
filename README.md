# Scrypta IdaNode Network

Questo repository servirà a gestire tutti gli IdaNode gestiti da Scrypta direttamente, così da poter accoppiare indirizzi IP con indirizzi Lyra dell'IdaNode e poter assegnare i sottodomini necessari.

## Obiettivo dell'iniziativa

Scrypta Blockchain è una rete decentralizzata e distribuita non avente un singolo organo di controllo. Per garantire la distribuzione anche alla rete di secondo livello degli IdaNode è necessario che il network sia egualmente mantenuto da più parti. Per garantire questo risultato Scrypta Foundation creerà una staking pool allocando una quantità di LYRA per ogni IdaNode attivato. La quantità di LYRA allocata dipende da alcuni fattori quali il possesso di altri masternode e altri fattori che verranno comunicati di seguito in via definitiva.

## A chi è rivolta

L'iniziativa è rivolta principalmente a sviluppatori, aziende interessate a sviluppare il network Scrypta ed entusisiasti del progetto che hanno voglia di contribuire. Sono richieste competenze tecniche per la messa in opera e gestione della macchina, che verrà ricompensata in base all'efficienza costante.

## Reward system

Le reward verranno divise tra i partecipanti calcolando il totale giornaliero prodotto dalla pool e dividendolo per il numero di IdaNode. La proporzione degli IdaNode viene calcolata in base all'uptime e quindi la partecipazione di ogni IdaNode è calcolata in 1440 parti.

Ogni parte si acquisisce se ogni minuto l'IdaNode soddisfa i seguenti requisiti:

- L'IdaNode è attivo, ovvero risponde alla chiamata `/wallet/getinfo` in modo positivo.
- L'IdaNode è sincronizzato al network Scrypta con uno scarto massimo di **1** blocco.
- Il codice dell'IdaNode è integro ed il checksum, controfirmato con il timestamp della richiesta e firmato con lo stesso indirizzo inserito nel file `peers`. Questa operazione avviene in modo automatico all'interno di ogni IdaNode.

La somma dei singoli uptime restituiranno gli shares totali e quindi i calcoli percentuali per singolo IdaNode. Queste verranno inviate in modo automatico su base giornaliera, alle 00.00 di ogni giorno.

## Come funziona l'elenco degli IdaNode

Nel file `peers` verranno annotati tutti gli IdaNode accettati e dovranno essere annotati secondo una forma ben precisa. Ogni riga dovrà contenere questo tipo di informazioni:

```
N_PROGRESSIVO:INDIRIZZO_IP:PUBKEY_INDIRIZZO_IDANODE
```

Il numero progressivo andrà ricavato sommando `1` al numero progressivo superiore. Per i numeri inferiori a `10` è necessario aggiungere lo `0` iniziale così da avere progressivi di due cifre.

## Come richiedere l'aggiunta

L'aggiunta va fatta direttamente in questo repository, comunicando i parametri richiesti `INDIRIZZO_IP` e `INDIRIZZO_LYRA`. A seguito della richiesta e dell'accettazione l'IdaNode verrà inserito all'interno del file `peers`, della libreria npm `@scrypta/core` e quindi nella piattaforma https://watchtower.scryptachain.org.

## Politica di delisting

Qualora un IdaNode rimane inattivo per più di 7gg allora verrà automaticamente delistato dalla lista dei `peers` e quindi da `@scrypta/core`.