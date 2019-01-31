

/* global getParticipantRegistry getAssetRegistry getFactory */

/**
 *  Une Shipment à été recu par un Importer 
 * @param {org.acme.beer.ShipmentRecu} ShipmentRecu - ShipmentRecu transaction
 * @transaction
 */
async function payOut(shipmentRecu) {  // eslint-disable-line no-unused-vars

    const contract = shipmentRecu.contract;
    const shipment = shipmentRecu.contract.shipment;
    let payOut = contract.unitPrice * shipment.unitCount;

    console.log('Received at: ' + shipmentRecu.timestamp);
    console.log('Contract arrivalDateTime: ' + contract.arriverDateTime);

    // On definit le statut 
    shipment.statut = 'ARRIVED';

    // si shipment n'est pa recu en temps le solde est egale 0 
    if (shipmentRecu.timestamp > contract.arriverDateTime) {
        payOut = 0;
        console.log('DELAYED');
    } else {
        // on cherche la temperature minimale dans le tableau lectureTemperature
        if (shipment.lectureTemperature) {
            // on trie le tableau 
            shipment.lectureTemperature.sort(function (a, b) {
                return (a.celsius - b.celsius);
            });
            // temp mini
            const lowestReading = shipment.lectureTemperature[0];
            // temp max 
            const highestReading = shipment.lectureTemperature[shipment.lectureTemperature.length - 1];
           
    
            let penalty = 0;
            console.log('Lowest temp reading  : ' + lowestReading.celsius);
            console.log('Highest temp reading : ' + highestReading.celsius);

            // Cas 1 : temperature minimal < temp Contract  
            if (lowestReading.celsius < contract.minTemperature) {
                // penalite proportionnel 
                penalty += (contract.minTemperature - lowestReading.celsius) * contract.minPenaltyFacteur;
                console.log('Minimal temperature penalty : ' + penalty);
            }

            // Cas 2: temperature max > temp Contract ? 
            if (highestReading.celsius > contract.maxTemperature) {
                // penalite proportionnel 
                penalty += (highestReading.celsius - contract.maxTemperature) * contract.maxPenaltyFactr;
                console.log('Maximal temperature penalty : ' + penalty);
            }

            // On soustrait la penalite à ce qui doit etre payé
            payOut -= (penalty * shipment.unitCount);

            if (payOut < 0) {
                payOut = 0;
            }
        }
    }

    // MAJ de l' etat de la Shipment
    const registreShipment = await getAssetRegistry('org.acme.beer.Shipment');
    await registreShipment.update(shipment);

    contract.importer.accountBalance -= payOut;
    contract.shipper.accountBalance += payOut;

    // MAJ du solde Importer 
    const importerRegistre = await getParticipantRegistry('org.acme.beer.Importer');
    await importerRegistre.update(contract.importer);

    // MAJ du solde Exportateur 
    const shipperRegistre = await getParticipantRegistry('org.acme.beer.Shipper');
    await shipperRegistre.update(contract.shipper);
    
}



/**
 * A temperature reading has been received for a shipment
 * @param {org.acme.beer.LectureTemperature} lectureTemperature- the lectureTemperature transaction
 * @transaction
 */
async function lectureTemperature(lectureTemperature) {  // eslint-disable-line no-unused-vars

    const shipment = lectureTemperature.contract.shipment;
    const contract = lectureTemperature.contract 

    console.log('Association between the temperature ' + lectureTemperature.celsius + ' and the shipment ' + shipment.$identifier);

    if (shipment.lectureTemperature) {
        shipment.lectureTemperature.push(lectureTemperature);
    } else {
        shipment.lectureTemperature = [lectureTemperature];
    }

    // on ajoute la temperature lu au tableau LectureTemperature
    const shipmentRegistre = await getAssetRegistry('org.acme.beer.Shipment');
    await shipmentRegistre.update(shipment);
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

    // Creation le Brewer : IPA 
    const Brewer_ipa= factory.newResource(NS, 'Brewer', 'ipa@email.com');
    Brewer_ipa.libelle="IPA";
    Brewer_ipa.country = 'USA';
    Brewer_ipa.accountBalance = 200;

    //Creation Importer : Carrefour 
    const Importer_carrefour = factory.newResource(NS, 'Importer', 'carrefour@email.com');
    Importer_carrefour.libelle ="Carrefour";
    Importer_carrefour.country = 'FRANCE';
    Importer_carrefour.accountBalance = 10000;

    // Creation Shipper 1
    const Shipper_1 = factory.newResource(NS, 'Shipper', 'camion.boston@email.com');
    Shipper_1.libelle="Truck Boston"
    Shipper_1.country ='USA';
    Shipper_1.accountBalance = 5000;

    // Creation Shipper 2
    const Shipper_2 = factory.newResource(NS, 'Shipper', 'bateau@email.com');
    Shipper_2.libelle="Ship Boston - Le Havre"
    Shipper_2.country ='USA';
    Shipper_2.accountBalance = 5000;

    // Creation Shipper 3
    const Shipper_3 = factory.newResource(NS, 'Shipper', 'camion.lehavre@email.com');
    Shipper_3.libelle="Truck Seaport - Gare du Havre"
    Shipper_3.country ='USA';
    Shipper_3.accountBalance = 5000;

    // Creation Shipper 4
    const Shipper_4 = factory.newResource(NS, 'Shipper', 'train@email.com');
    Shipper_4.libelle="Train Le Havre - Paris"
    Shipper_4.country ='USA';
    Shipper_4.accountBalance = 5000;

    // ajout du Brewer au registre participant global 
    const BrewerRegistre = await getParticipantRegistry(NS + '.Brewer');
    await BrewerRegistre.addAll([Brewer_ipa]);
    
    //  ajout de l Importer registre Participant global
    const ImporterRegistry = await getParticipantRegistry(NS + '.Importer');
    await ImporterRegistry.addAll([Importer_carrefour]);

    //  ajout de l'Shipper 1 au registre Participan global
    const ShipperRegistre = await getParticipantRegistry(NS + '.Shipper');
    await ShipperRegistre.addAll([Shipper_1,Shipper_2,Shipper_3,Shipper_4]);
    

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


    // Creation de la Shipment 
    const shipment     = factory.newResource(NS, 'Shipment', 'SHIPMENT_001');
    shipment.statut    = 'IN_TRANSIT';
    shipment.unitCount = 5000;

    // Creation du Contract n°1 
    const contract_1 = factory.newResource(NS, 'Contract', 'CON_001');
    
    contract_1.shipment   = factory.newRelationship(NS,'Shipment','SHIPMENT_001');
    contract_1.brewer    = factory.newRelationship(NS, 'Brewer', 'ipa@email.com');
    contract_1.importer = factory.newRelationship(NS, 'Importer', 'carrefour@email.com');
    contract_1.shipper  = factory.newRelationship(NS, 'Shipper', 'camion.boston@email.com');
   
    contract_1.etape  = "Initial";
    contract_1.depart = "USA";
    contract_1.arrive = "FRANCE";

    const demain = setupDemo.timestamp;
    demain.setDate(demain.getDate() + 1);
    contract_1.arriverDateTime = demain; // Shipment doit arriver le lendemain
    
    contract_1.unitPrice = 0.5; // payer 50 centimes par unite
    contract_1.minTemperature = 2; // min temperature for the cargo
    contract_1.maxTemperature = 10; // max temperature for the cargo
    contract_1.minPenaliteFacteur= 0.2; // facteur qui reduit de 20 centimes pour chaques celsius en dessous de la min temp
    contract_1.maxPenaliteFacteur = 0.1; // facteur qui reduit de 10 centimes pour chaque celsius au dessus de la max temp
   

    // creation Contract 2 
    const contract_2 = factory.newResource(NS, 'Contract', 'CON_002');
    
    contract_2.shipment = factory.newRelationship(NS,'Shipment','SHIPMENT_001');
    contract_2.brewer = factory.newRelationship(NS, 'Brewer', 'ipa@email.com');
    contract_2.importer  = factory.newRelationship(NS, 'Importer', 'carrefour@email.com');
    contract_2.shipper = factory.newRelationship(NS, 'Shipper', 'bateau@email.com');
   
    contract_2.etape="Intermediate";
    contract_2.depart="USA";
    contract_2.arrive="FRANCE";


    const date_2 = setupDemo.timestamp;
    date_2.setDate(date_2.getDate() + 3);
    contract_2.arriverDateTime = date_2; // Shipment doit arriver le lendemain
    
    contract_2.unitPrice = 0.5; // payer 50 centimes par unite
    contract_2.minTemperature = 2; // min temperature for the cargo
    contract_2.maxTemperature = 10; // max temperature for the cargo
    contract_2.minPenaliteFacteur= 0.2; // facteur qui reduit de 20 centimes pour chaques celsius en dessous de la min temp
    contract_2.maxPenaliteFacteur = 0.1; // facteur qui reduit de 10 centimes pour chaque celsius au dessus de la max temp
    

    // creation Contract 3 
    const contract_3 = factory.newResource(NS, 'Contract', 'CON_003');
    
    contract_3.shipment = factory.newRelationship(NS,'Shipment','SHIPMENT_001');
    contract_3.brewer = factory.newRelationship(NS, 'Brewer', 'ipa@email.com');
    contract_3.importer  = factory.newRelationship(NS, 'Importer', 'carrefour@email.com');
    contract_3.shipper = factory.newRelationship(NS, 'Shipper', 'camion.lehavre@email.com');
   
    contract_3.etape="Intermediate";
    contract_3.depart="USA";
    contract_3.arrive="FRANCE";

    const date_3 = setupDemo.timestamp;
    date_3.setDate(date_3.getDate() + 4);
    contract_3.arriverDateTime = date_3; // Shipment doit arriver le lendemain
    
    contract_3.unitPrice = 0.5; // payer 50 centimes par unite
    contract_3.minTemperature = 2; // min temperature for the cargo
    contract_3.maxTemperature = 10; // max temperature for the cargo
    contract_3.minPenaliteFacteur= 0.2; // facteur qui reduit de 20 centimes pour chaques celsius en dessous de la min temp
    contract_3.maxPenaliteFacteur = 0.1; // facteur qui reduit de 10 centimes pour chaque celsius au dessus de la max temp
    

    // creation Contract 4
    const contract_4 = factory.newResource(NS, 'Contract', 'CON_004');
    
    contract_4.shipment = factory.newRelationship(NS,'Shipment','SHIPMENT_001');
    contract_4.brewer = factory.newRelationship(NS, 'Brewer', 'ipa@email.com');
    contract_4.importer  = factory.newRelationship(NS, 'Importer', 'carrefour@email.com');
    contract_4.shipper = factory.newRelationship(NS, 'Shipper', 'train@email.com');
   
    contract_4.etape="Intermediate";
    contract_4.depart="USA";
    contract_4.arrive="FRANCE";

    const date_4 = setupDemo.timestamp;
    date_4.setDate(date_4.getDate() + 5);
    contract_4.arriverDateTime = date_4; // Shipment doit arriver le lendemain
    
    contract_4.unitPrice = 0.5; // payer 50 centimes par unite
    contract_4.minTemperature = 2; // min temperature for the cargo
    contract_4.maxTemperature = 10; // max temperature for the cargo
    contract_4.minPenaliteFacteur= 0.2; // facteur qui reduit de 20 centimes pour chaques celsius en dessous de la min temp
    contract_4.maxPenaliteFacteur = 0.1; // facteur qui reduit de 10 centimes pour chaque celsius au dessus de la max temp
    



    //  ajout du Contract au registre Asset global 
    const contractRegistre = await getAssetRegistry(NS + '.Contract');
    await contractRegistre.addAll([contract_1,contract_2,contract_3,contract_4]);
    
    // ajout de la Shipment au registre Asset global
    const shipmentRegistre = await getAssetRegistry(NS + '.Shipment');
    await shipmentRegistre.addAll([shipment]);
}