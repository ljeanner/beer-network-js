# beer-network-js
test
Ce registre distribué tourne sur Hyperledger Fabric, en utilisant le framework Composer<br>

<h2> Tester le code </h2> 
<li> Aller sur : 
https://composer-playground-unstable.mybluemix.net/ </li> 
<li> Cliquer sur : "Deploy New Business Network" 
<li> Pour déployer, utiliser l'archive BNA </li> 
<li> Une fois le reseau deployé, il faut aller dans l'onglet test pour ajouter des nouveaux participants, contrats ... </li> 

<li> Pour prendre en main Hyperledger Composer : https://jeanneret-lucile.gitbook.io/hyperledeger-fabric/ </li>
<h2>Scenario</h2>
<p>Voici les différentes étapes pour le suivi de la bière : 
<ul>
<li>Une palette de bière de type IPA brassée aux USA est transportée de la brasserie jusqu'au port de Boston en camion</li>
<li>Du port de Boston il part en porte conteneur jusqu'au port du Havre</li>
<li>Du port du Havre il va en camion jusqu'à la gare du Havre</li>
<li>De la gare du Havre elle est transportée jusqu'à la gare du Nord en train</li> 
<li>Puis elle est transportée en camion de la gare jusqu'au supermarché pour sa mise en rayon</li>
</ul>


<h2>  Condition du contrat  </h2> 

Notre réseau définit un contrat entre brasseurs, expéditeurs et importateurs pour le prix et le bon acheminement des bières, sur la base des relevés de température reçus pour les conteneurs d’expédition.
Le réseau définit un contrat entre brasseurs et importateurs. Le contrat stipule que: 
-	Lors de la réception de l'envoi, l'importateur paie au producteur : 
 	Le prix unitaire * le nombre d'unités de l'envoi

-	Les envois en retard sont gratuits selon un certain seuil de tolérance, sinon :
Proportionnelle à l’ampleur de la violation * un facteur de pénalité 
 
-	Une pénalité est appliquée aux envois qui ont dépassé le seuil minimal de température toléré : 
 Proportionnelle à l’ampleur de la violation * un facteur de pénalité 

-	Une pénalité est appliquée aux envois dépassant le seuil maximal toléré :
Proportionnelle à l’ampleur de la violation * un facteur de pénalité
Le réseau définit : 
Participants : Brasseur, Importateur, Expéditeur  
Assets : Contrat, Expédition
Transactions : LectureTemperature, ExpéditionRécu   


<h3> Deploy </h3>

- Pour obtenir la dernière image Docker de Hyperledger Composer-Playgroud : 
    <br><code>$ docker pull hyperledger/composer-playground</code>
- Lancez la commande suivante pour créer un conteneur Docker depuis votre image :
    <br><code>$ docker run -d -p 8080:8080 --name composer hyperledger/composer-playground:latest</code>
- Vérifier que votre conteneur est bien up & running : 
    <br><code>$ docker ps</code>
- Pour accéder à l'interface Composer, voici l'URL : <code>localhost:8080</code>
- Sur Composer ( en local ou en ligne ) : cliquer sur " Deploy a new business network"
- Aller dans la partie 2 "MODEL NETWORK STARTER TEMPLATE" et importer le ficher bna 
- Cliquer sur deploy 
- Dans test envoyer la transaction : Setup Demo ( definit les assets de la demo) puis SetupParticipants ( definit les participants)
- Envoyer les temperatures avec la transaction LectureTemperature et ShipmentRecu pour changer le statut d'une cargaison  
