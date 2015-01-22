
status: WIP

====

## Case study: Disqus importer

This website uses Riot for all the application logic: authentication, setup, settings and purchases.

Our Disqus importer deserves special attention. It's a fairly large application with 10 navitatable "slides" and websocket based client/server communication. It crunches enormous amount of Disqus posts in a second displaying a live stream of the import status. It was formerly written with React but later rewritten with Riot 2.0.

Here's is what happened:

* XX less lines of code because of the lack of React boilerplate. The code became easier to understand since only the raw logic is ther.

* Human readable architecture due to custom HTML tags. Our new employees can gasp the code, regardless of background.

* 130K of bandwidth savings and reduced time on initial JS execution

We arleady used Riot 1.0 for events and routing so we couldn't strip any bits from these areas or make them any simpler (on our taste).

What the heck – try it out in case you are on Disqus! You not only seee Riot in action but it really makes sense to turn your blog commenting into iframe- less, truly integrated solution with extreme performance and endless customization possibilities.

Also, please poke around the [source code]() of the importer.
