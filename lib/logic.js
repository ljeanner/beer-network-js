

/* global getParticipantRegistry getAssetRegistry getFactory */

/**
 *  Une cargaison à été recu par un importateur 
 * @param {org.acme.beer.CargaisonRecu} cargaisonRecu - cargaisonRecu transaction
 * @transaction
 */
async function payOut(cargaisonRecu) {  // eslint-disable-line no-unused-vars

    const contrat = cargaisonRecu.cargaison.contrat;
    const cargaison = cargaisonRecu.cargaison;
    let payOut = contrat.unitPrice * cargaison.unitCount;

    console.log('Received at: ' + cargaisonRecu.timestamp);
    console.log('contrat arrivalDateTime: ' + contrat.arriverDateTime);

    // On definit le statut 
    cargaison.statut = 'ARRIVE';

    // si l'cargaison n'est pa recu en temps le solde est egale 0 
    if (cargaisonRecu.timestamp > contrat.arriverDateTime) {
        payOut = 0;
        console.log('RETARD');
    } else {
        // on cherche la temperature minimale dans le tableau lectureTemperature
        if (cargaison.lectureTemperature) {
            // on trie le tableau 
            cargaison.lectureTemperature.sort(function (a, b) {
                return (a.celsius - b.celsius);
            });
            // temp mini
            const lowestReading = cargaison.lectureTemperature[0];
            // temp max 
            const highestReading = cargaison.lectureTemperature[cargaison.lectureTemperature.length - 1];
           
    
            let penalty = 0;
            console.log('Lowest temp reading: ' + lowestReading.celsius);
            console.log('Highest temp reading: ' + highestReading.celsius);

            // Cas 1 : temperature minimal < temp contrat  
            if (lowestReading.celsius < contrat.minTemperature) {
                // penalite proportionnel 
                penalty += (contrat.minTemperature - lowestReading.celsius) * contrat.minPenaltyFactor;
                console.log('Min temp penalty: ' + penalty);
            }

            // Cas 2: temperature max > temp contrat ? 
            if (highestReading.celsius > contrat.maxTemperature) {
                // penalite proportionnel 
                penalty += (highestReading.celsius - contrat.maxTemperature) * contrat.maxPenaltyFactor;
                console.log('Max temp penalty: ' + penalty);
            }

            // On soustrait la penalite à ce qui doit etre payé
            payOut -= (penalty * cargaison.unitCount);

            if (payOut < 0) {
                payOut = 0;
            }
        }
    }

    // MAJ de l' etat de la cargaison
    const registreCargaison = await getAssetRegistry('org.acme.beer.Cargaison');
    await registreCargaison.update(cargaison);

    contrat.importateur.accountBalance -= payOut;
    contrat.expediteur.accountBalance += payOut;

    // MAJ du solde Importateur 
    const importateurRegistre = await getParticipantRegistry('org.acme.beer.Importateur');
    await importateurRegistre.update(contrat.importateur);

    // MAJ du solde Exportateur 
    const expediteurRegistre = await getParticipantRegistry('org.acme.beer.Expediteur');
    await expediteurRegistre.update(contrat.expediteur);
    
}

/*
async function exchange(credite, crediteur, cargaisonRecu) {
    
    const payOut = payOut(cargaisonRecu)
    console.log("Payout: " + payOut);
	contrat.credite.accountBalance += payOut;
	contrat.crediteur.accountBalance -= payOut;

	console.log(contrat.credite.$identifier + "\new balance: " + contrat.credite.accountBalance);
	console.log(contrat.crediteur.$identifer + "\new balance: " + contrat.crediteur.accountBalance);

	// MAJ du solde du credite
	const registreCredite = await getParticipantRegistry("org.acme.beer." + contrat.credite) //.$identifier);
	await registreCredite.update(contrat.credite);

	// MAJ du solde du crediteur
	const registreCrediteur = await getParticipantRegistry("org.acme.beer." + contrat.crediteur) //.$identifier);
	await registreCrediteur.update(contrat.crediteur);

	// MAJ de l'état de l'expédition
	const registreCargaison = await getAssetRegistry("org.acme.beer.Cargaison");
	await registreCargaison.update(cargaison);
}

*/

/**
 * A temperature reading has been received for a shipment
 * @param {org.acme.beer.LectureTemperature} lectureTemperature- the lectureTemperature transaction
 * @transaction
 */
async function lectureTemperature(lectureTemperature) {  // eslint-disable-line no-unused-vars

    const cargaison = lectureTemperature.contrat.cargaison;
    const contrat = lectureTemperature.contrat 

    console.log('Association temperature ' + lectureTemperature.celsius + ' à la cargaison ' + cargaison.$identifier);

    if (cargaison.lectureTemperature) {
        cargaison.lectureTemperature.push(lectureTemperature);
    } else {
        cargaison.lectureTemperature = [lectureTemperature];
    }

    // on ajoute la temperature lu au tableau LectureTemperature
    const cargaisonRegistre = await getAssetRegistry('org.acme.beer.Cargaison');
    await cargaisonRegistre.update(cargaison);
}

/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {org.acme.beer.SetupParticipant} setupParticipant - the SetupParticipant transaction
 * @transaction
 * 
 */

async function setupParticipant(setupParticipant){
    const factory = getFactory();
    const NS = 'org.acme.beer';

    // Creation le brasseur : IPA 
    const brasseur_ipa= factory.newResource(NS, 'Brasseur', 'ipa@email.com');
    brasseur_ipa.libelle="IPA";
    brasseur_ipa.country = 'USA';
    brasseur_ipa.accountBalance = 200;

    //Creation Importateur : Carrefour 
    const importateur_carrefour = factory.newResource(NS, 'Importateur', 'carrefour@email.com');
    importateur_carrefour.libelle ="Carrefour";
    importateur_carrefour.country = 'FRANCE';
    importateur_carrefour.accountBalance = 10000;

    // Creation Expediteur 1
    const expediteur_1 = factory.newResource(NS, 'Expediteur', 'camion.boston@email.com');
    expediteur_1.libelle="Camion Boston"
    expediteur_1.country ='USA';
    expediteur_1.accountBalance = 5000;

    // Creation Expediteur 2
    const expediteur_2 = factory.newResource(NS, 'Expediteur', 'bateau@email.com');
    expediteur_2.libelle="Bateau Boston - Le Havre"
    expediteur_2.country ='USA';
    expediteur_2.accountBalance = 5000;

    // Creation Expediteur 3
    const expediteur_3 = factory.newResource(NS, 'Expediteur', 'camion.lehavre@email.com');
    expediteur_3.libelle="Camion port - gare du Havre"
    expediteur_3.country ='USA';
    expediteur_3.accountBalance = 5000;

    // Creation Expediteur 4
    const expediteur_4 = factory.newResource(NS, 'Expediteur', 'train@email.com');
    expediteur_4.libelle="Train Le Havre - Paris"
    expediteur_4.country ='USA';
    expediteur_4.accountBalance = 5000;

    // ajout du brasseur au registre participant global 
    const brasseurRegistre = await getParticipantRegistry(NS + '.Brasseur');
    await brasseurRegistre.addAll([brasseur_ipa]);
    
    //  ajout de l importateur registre Participant global
    const importateurRegistry = await getParticipantRegistry(NS + '.Importateur');
    await importateurRegistry.addAll([importateur_carrefour]);

    //  ajout de l'expediteur 1 au registre Participan global
    const expediteurRegistre = await getParticipantRegistry(NS + '.Expediteur');
    await expediteurRegistre.addAll([expediteur_1,expediteur_2,expediteur_3,expediteur_4]);
    

}
 

/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {org.acme.beer.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 * 
 */
async function setupDemo(setupDemo) {  // eslint-disable-line no-unused-vars

    /* Get Factory.Fatory peut être utilisée pour créer de nouvelles instances d'asset, de participants et de transactions 
    pour le stockage dans des registres. 
    Factory peut également être utilisée pour créer des relations avec des assets, des participants et des transactions.
    */ 
    const factory = getFactory();
    const NS = 'org.acme.beer';


    // Creation de la cargaison 
    const cargaison     = factory.newResource(NS, 'Cargaison', 'CARGAISON_001');
    cargaison.statut    = 'EN_TRANSIT';
    cargaison.unitCount = 5000;

    // Creation du contrat n°1 
    const contrat_1 = factory.newResource(NS, 'Contrat', 'CON_001');
    
    contrat_1.cargaison   = factory.newRelationship(NS,'Cargaison','CARGAISON_001');
    contrat_1.brasseur    = factory.newRelationship(NS, 'Brasseur', 'ipa@email.com');
    contrat_1.importateur = factory.newRelationship(NS, 'Importateur', 'carrefour@email.com');
    contrat_1.expediteur  = factory.newRelationship(NS, 'Expediteur', 'camion.boston@email.com');
   
    contrat_1.etape  = "initial"
    contrat_1.depart = "USA";
    contrat_1.arrive = "FRANCE";

    const demain = setupDemo.timestamp;
    demain.setDate(demain.getDate() + 1);
    contrat_1.arriverDateTime = demain; // cargaison doit arriver le lendemain
    
    contrat_1.unitPrice = 0.5; // payer 50 centimes par unite
    contrat_1.minTemperature = 2; // min temperature for the cargo
    contrat_1.maxTemperature = 10; // max temperature for the cargo
    contrat_1.minPenaliteFacteur= 0.2; // facteur qui reduit de 20 centimes pour chaques celsius en dessous de la min temp
    contrat_1.maxPenaliteFacteur = 0.1; // facteur qui reduit de 10 centimes pour chaque celsius au dessus de la max temp
   

    // creation contrat 2 
    const contrat_2 = factory.newResource(NS, 'Contrat', 'CON_002');
    
    contrat_2.cargaison = factory.newRelationship(NS,'Cargaison','CARGAISON_001');
    contrat_2.brasseur = factory.newRelationship(NS, 'Brasseur', 'ipa@email.com');
    contrat_2.importateur  = factory.newRelationship(NS, 'Importateur', 'carrefour@email.com');
    contrat_2.expediteur = factory.newRelationship(NS, 'Expediteur', 'bateau@email.com');
   
    contrat_2.etape="intermedaire"
    contrat_2.depart="USA";
    contrat_2.arrive="FRANCE";


    const date_2 = setupDemo.timestamp;
    date_2.setDate(date_2.getDate() + 3);
    contrat_2.arriverDateTime = date_2; // cargaison doit arriver le lendemain
    
    contrat_2.unitPrice = 0.5; // payer 50 centimes par unite
    contrat_2.minTemperature = 2; // min temperature for the cargo
    contrat_2.maxTemperature = 10; // max temperature for the cargo
    contrat_2.minPenaliteFacteur= 0.2; // facteur qui reduit de 20 centimes pour chaques celsius en dessous de la min temp
    contrat_2.maxPenaliteFacteur = 0.1; // facteur qui reduit de 10 centimes pour chaque celsius au dessus de la max temp
    

    // creation contrat 3 
    const contrat_3 = factory.newResource(NS, 'Contrat', 'CON_003');
    
    contrat_3.cargaison = factory.newRelationship(NS,'Cargaison','CARGAISON_001');
    contrat_3.brasseur = factory.newRelationship(NS, 'Brasseur', 'ipa@email.com');
    contrat_3.importateur  = factory.newRelationship(NS, 'Importateur', 'carrefour@email.com');
    contrat_3.expediteur = factory.newRelationship(NS, 'Expediteur', 'camion.lehavre@email.com');
   
    contrat_3.etape="intermedaire"
    contrat_3.depart="USA";
    contrat_3.arrive="FRANCE";

    const date_3 = setupDemo.timestamp;
    date_3.setDate(date_3.getDate() + 4);
    contrat_3.arriverDateTime = date_3; // cargaison doit arriver le lendemain
    
    contrat_3.unitPrice = 0.5; // payer 50 centimes par unite
    contrat_3.minTemperature = 2; // min temperature for the cargo
    contrat_3.maxTemperature = 10; // max temperature for the cargo
    contrat_3.minPenaliteFacteur= 0.2; // facteur qui reduit de 20 centimes pour chaques celsius en dessous de la min temp
    contrat_3.maxPenaliteFacteur = 0.1; // facteur qui reduit de 10 centimes pour chaque celsius au dessus de la max temp
    

    // creation contrat 4
    const contrat_4 = factory.newResource(NS, 'Contrat', 'CON_004');
    
    contrat_4.cargaison = factory.newRelationship(NS,'Cargaison','CARGAISON_001');
    contrat_4.brasseur = factory.newRelationship(NS, 'Brasseur', 'ipa@email.com');
    contrat_4.importateur  = factory.newRelationship(NS, 'Importateur', 'carrefour@email.com');
    contrat_4.expediteur = factory.newRelationship(NS, 'Expediteur', 'train@email.com');
   
    contrat_4.etape="intermedaire"
    contrat_4.depart="USA";
    contrat_4.arrive="FRANCE";

    const date_4 = setupDemo.timestamp;
    date_4.setDate(date_4.getDate() + 5);
    contrat_4.arriverDateTime = date_4; // cargaison doit arriver le lendemain
    
    contrat_4.unitPrice = 0.5; // payer 50 centimes par unite
    contrat_4.minTemperature = 2; // min temperature for the cargo
    contrat_4.maxTemperature = 10; // max temperature for the cargo
    contrat_4.minPenaliteFacteur= 0.2; // facteur qui reduit de 20 centimes pour chaques celsius en dessous de la min temp
    contrat_4.maxPenaliteFacteur = 0.1; // facteur qui reduit de 10 centimes pour chaque celsius au dessus de la max temp
    



    //  ajout du contrat au registre Asset global 
    const contratRegistre = await getAssetRegistry(NS + '.Contrat');
    await contratRegistre.addAll([contrat_1,contrat_2,contrat_3,contrat_4]);
    
    // ajout de la cargaison au registre Asset global
    const cargaisonRegistre = await getAssetRegistry(NS + '.Cargaison');
    await cargaisonRegistre.addAll([cargaison]);
}