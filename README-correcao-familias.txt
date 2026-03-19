Substituições sugeridas no MENNU

1. Coloque `RecipePhoto-familias-corrigido.tsx` no lugar do seu `RecipePhoto.tsx`.
2. Coloque `recipes-familias-corrigido.json` no lugar do seu `data/recipes.json`.
3. Salve as imagens de família em `public/recipes/families/`.

Formato esperado das imagens:
- /public/recipes/families/omelete.webp
- /public/recipes/families/sanduiche.webp
- /public/recipes/families/tapioca.webp
- etc.

O componente agora:
- ignora URLs remotas quebradas
- tenta imagem específica por receita (.webp e .jpg)
- cai para imagem da família automaticamente
- por último mostra a ilustração local com emoji
