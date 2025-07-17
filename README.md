# Assessment

De lokale pizzeria heeft besloten om hun pizza’s ook online te gaan verkopen. Bij online bestellingen wil de pizzeria hun klanten de optie geven om zelf hun pizza samen te stellen.

## Functionaliteiten

- Een klant mag kiezen om maximaal **6 toppings** op de pizza te doen, met een **minimum van 2 toppings**.
- De **grootte van de pizza** kan gekozen worden: _small_, _medium_, _large_.
- Het is mogelijk om een **drankje** te kiezen.

Na het samenstellen van de bestelling toont het systeem de **totaalprijs**. Deze wordt berekend op basis van:

- De grootte van de pizza.
- Het aantal toppings: de **3 goedkoopste toppings zijn gratis**, daarna geldt per topping een individuele prijs.
- Of de bestelling een drankje bevat.

**Speciale korting:**  
Wanneer een klant een pizza met _ananas_ bestelt en het is **warmer dan 30°C**, krijgt deze **10% korting** op deze pizza.  
De temperatuur wordt opgehaald via de [Open Meteo API](https://open-meteo.com/).

Alle prijsberekeningen vinden plaats in de **back-end**.

Na bevestiging van de bestelling verschijnt een melding dat de bestelling ontvangen is. **Afrekenen is niet nodig via de applicatie**; dit gebeurt bij ontvangst van de pizza.

---

## Technische eisen

- De front-end mag basic zijn en is gebaseerd op een framework naar keuze.
- Er wordt gebruik gemaakt van **TypeScript**.
- Communicatie tussen front-end en server verloopt via een **REST API**.
- De volgende onderdelen zijn als entiteit opgeslagen in een database:
  - De toppings
  - De verschillende drankjes
  - De bestelde pizza’s

---

## Bonus

- Het systeem bevat een aantal **voor-geconfigureerde pizza’s**, zodat de klant snel een pizza kan selecteren zonder zelf te configureren.
- **Vaste klanten** hebben een coupon ontvangen die ze eenmalig kunnen gebruiken voor **10% korting op de gehele bestelling** bij online bestellingen.
