
# Documenta - Programma di storage dei dati

Al fine di intensificare le attività di archiviazione e storage dei dati è stato attivato un nuovo programma di archiviazione decentralizzata basata su S3 Bucket (AWS, DigitalOcean, etc.). 

Ogni IdaNode potrà essere dotato di una sua controparte storage così da garantire maggiore sicurezza e maggiore replicabilità alle informazioni inserite nel network. 
Questo tipo di archiviazione, per gli utenti, non è gratuita ma viene pagata anticipatamente (in LYRA) attraverso un indirizzo multisignature creato tra l'utente, la pool e l'idanode con potere di firma di 2 su 3.

 Questo significa che chiunque delle due parti (idanode e utente) può accedere ai fondi grazie alla pool, che di fatto agirà da smart contract tra le parti verificando che l'utente è in regola con i propri pagamenti sia che l'idanode sia effettivamente ancora in possesso del file e che il file sia raggiungibile al momento del payout giornaliero.

L'utente potrà comunque accedere ai fondi inseriti anche se la pool sparisce, con l'aiuto dell'IdaNode.

Ogni utente potrà quindi decidere da un minimo di 6 repliche al massimo rappresentato dal numero degli IdaNode attivi. Quindi il costo dello stoccaggio delle informazioni sarà moltiplicato per il numero di repliche selezionate. E' chiaro che un numero maggiore di repliche garantirà un'accessibilità maggiore, così come una resilienza maggiore alla censura e alla distruzione del dato.

## Perchè non farlo all'interno dello stesso server

La risposta è abbastanza semplice e riguarda principalmente il costo dello storage interno ai server se confrontato con il costo degli storage S3. Per ottenere, ad esempio, 250GB di archiviazione su un server Digital Ocean occorrono 80$ al mese, per ottenerne la stessa quantità su uno Space (S3) ne occorrono solo 5$!

# Vantaggi
## Sincronizzazione dei dati

Essendo comunque i dati all'interno di uno o più S3 si potrà sempre scaricarli e tenerli aggiornati all'interno del proprio computer, server o altro spazio di backup.

## Notarizzazione automatica

Il vantaggio principale di una soluzione del genere, rispetto ad un cloud qualsiasi, è la notarizzazione automatica di tutti i file. Questi file potranno effettivamente essere gestiti via interfaccia grafica in sottocartelle, rappresentati da indirizzi della blockchain.

## Verifica dei file

La verifica dei file avviene grazie ad una seconda dApp, collegata ad un indirizzo o ad un QR code. La dApp potrà leggere e scaricare tutti i dati e tutte le informazioni inserite all'interno dell'indirizzo stesso. Nel caso in cui il tipo di file fosse PDF o Immagine è possibile avere un'anteprima via dApp oppure sarà possibile scaricare il file stesso nel proprio dispositivo.

# Costo di archiviazione

Il costo di archiviazione è di 0.015$ (_circa 0,501 LYRA_) per 1GB di spazio di archiviazione al mese e questo costo verrà dato sottoforma di reward in LYRA agli IdaNode selezionati dall'utente stesso in forma anticipata. Questa procedura avverrà in forma automatica direttamente via interfaccia grafica sulla dApp Documenta, sia essa in locale o nella sua versione online https://manager.documenta.app.

Chiaramente il tutto sarà commisurato alla dimensione specifica dei file inseriti e il prezzo in LYRA verrà regolato ogni 1440 blocchi sulla base del valore medio della LYRA nelle ultime 2 settimane, così da garantire equità e bilanciamento anche nel caso di sbalzo di valore e verranno distribuite al contempo le reward ad ogni IdaNode partecipante.

# Cancellazione dei file

I file verranno cancellati se l'utente chiederà di farlo e se, chiaramente, l'utente non inserirà all'interno dell'indirizzo multisignature l'ammontare di LYRA necessarie all'archiviazione per un periodo consecutivo di 30 giorni. E' comunque importante comprendere che a prescindere dal fatto che i file vengono cancellati dallo storage cloud la notarizzazione esisterà a livello blockchain per sempre così come le eventuali copie locali.