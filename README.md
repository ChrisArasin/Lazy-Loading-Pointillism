# Lazy Loading Pointillism

A placeholder for lazy-loaded images created by sampling colors from a low-res copy

The low-res images is drawn on a hidden canvas element, which can then be used to sample colors at the corresponding positions. I'm using div elements for the dots, (though arguably SVG elements could make more sense) so for now, removing the border-radius rule from the dots will display a series of square tiles instead.
