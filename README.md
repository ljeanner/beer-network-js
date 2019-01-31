# beer-network-js
Beer network runing on hyperledger composer framework  <br>

<h2> Tester le code </h2> 
<li> Aller sur : 
https://composer-playground-unstable.mybluemix.net/ </li> 
<li> Cliquer sur : "Deploy New Business Network" 
<li> Pour deployer, utiliser l'archive BNA </li> 
<li> Une foi le reseau deployer, aller dans l'onglet test pour ajouter des nouveaux participants, contrat ... </li> 

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

Notre réseau définit un contrat entre brasseurs, expéditeurs et importateurs pour le prix et le bon acheminement de bières, sur la base des relevés de température reçus pour les conteneurs d’expédition.
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
