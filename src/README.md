Example Pattern Library
=======================

Projekt on yles ehitatud sc5-styleguide peale ja selle kohta saab tapsemalt lugeda sellelt viitelt https://github.com/SC5/sc5-styleguide

projekti kaivitamise gulp taskide kohta saab lugeda sc5-styleguide readme.md failist

pohi arendus kaib src kataloogis.
/src
/src /components - koik componendid, mida saab viewsse includida
/src /template - koik kombineeritud komponendid, mida saab viewsse includida
/src /views - koik lehe vaated

/build ja /tmp on system sc5-styleguide kataloogid, need genetakse automaatselt

Arendame sassis ja kasutame BEM lahenemist

#Komponendi arendus

* Komponetides on kasutusel handelbars template süsteem.
* Vaikimise väärtsi parameetritele saab anda kasutades **default** abilist {{default parameetriNimi "vaikimise väärtus}}
* Komponendi kasutamine teiste "tükkide" - komponentide/template'ide/vaadete sees on võimalik handelbarsi **includega** {{> components/buttons/buttons displayText="Uus väertus siia"}}


When you are creating an actual styleguide your team needs to agree on the semantics (naming, structure, coding style) of how you will contruct your project. Different ways may suit different projects and teams. Whatever your preferences and decisions are, we recommend that you document your approach in the overview chapter (this one) of your style guide so everyone in the team has a shared opinion on how the markup and styles are constructed in the project.

In this tutorial we present one, strongly opinionated way of organising your project. The approach promoted here is inspired by the Philip Walton's essay "[CSS Architecture](http://philipwalton.com/articles/css-architecture/)", Brad Frost's "[Atomic web design](http://bradfrost.com/blog/post/atomic-web-design/)" concept and [BEM](http://bem.info/) naming from Yandex. You may wish to quickly skim through some of the content behind the links. Don't worry about them too much. We'll revisit it all in small chunks. However, the tutorial does not attempt to be fully compliant with any one of these approaches.

For an actual styleguide you may also wish to document details about the design language and the tone of voice used in the user interface. The overview chapter can also be used to document such general guidelines.

Now, move on to the Atoms chapter and proceed through the following chapters in numerical order.

