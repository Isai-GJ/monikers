# Monikers - El Juego de Adivinanzas por Equipos

¡Bienvenido a Monikers! Una adaptación digital del divertidísimo juego de mesa, perfecto para animar cualquier reunión con amigos. Este proyecto está construido con HTML, CSS y JavaScript puro, ofreciendo una experiencia de juego fluida y accesible directamente en tu navegador.

## Resumen del Proyecto

Este es un juego web interactivo por equipos donde los jugadores deben adivinar personajes, conceptos y frases de la cultura pop. El juego gestiona automáticamente la creación del mazo de cartas, el tiempo de cada turno, el conteo de puntos y el progreso a través de tres rondas con reglas cada vez más desafiantes.

## 📜 Reglas del Juego

El objetivo es que tu equipo adivine la mayor cantidad de cartas posible antes de que se acabe el tiempo. El equipo con más puntos al final de las tres rondas gana.

1.  **Configuración**:
    *   Formen al menos dos equipos e ingresen sus nombres.
    *   Elijan el número de cartas que estarán en juego para la partida. Estas mismas cartas se usarán en las tres rondas.

2.  **Ronda 1: ¡Todo se vale!**
    *   El jugador en turno debe describir la palabra en la carta a su equipo.
    *   Puedes usar pistas, sonidos y gestos. La única restricción es **no decir ninguna de las palabras** que aparecen en la carta.
    *   El equipo intenta adivinar tantas cartas como pueda antes de que se acabe el tiempo.

3.  **Ronda 2: Una sola palabra.**
    *   Se usan las mismas cartas que fueron adivinadas en la Ronda 1.
    *   Ahora, el jugador en turno solo puede decir **una única palabra** como pista para cada carta. Nada más.
    *   ¡La memoria es clave! Recordar las cartas de la ronda anterior ayudará mucho.

4.  **Ronda 3: ¡Solo mímica!**
    *   De nuevo, se usan las mismas cartas.
    *   En esta ronda final, no se puede emitir ningún sonido. El jugador en turno debe describir la carta usando **únicamente gestos y mimica**.

### ¿Cómo funciona un turno?

*   **Tiempo**: Cada turno dura 60 segundos (o el tiempo configurado).
*   **Adivinar**: Cuando tu equipo adivina correctamente, presiona el botón **"¡Adivinado!"** para sumar un punto y recibir una nueva carta.
*   **Pasar**: Si te atascas con una carta, puedes presionar **"Pasar"**. La carta volverá al mazo y podría aparecer más tarde en el mismo turno si queda tiempo.
*   **Fin del turno**: El turno termina cuando se acaba el tiempo. Las cartas que no se adivinaron (incluyendo la que estaba en pantalla y las pasadas) se devuelven al mazo para el siguiente equipo.

### Fin del Juego

Cuando la tercera ronda termina, el juego muestra las puntuaciones finales. ¡El equipo con la puntuación más alta es el ganador!

---

Desarrollado por Isai-GJ.