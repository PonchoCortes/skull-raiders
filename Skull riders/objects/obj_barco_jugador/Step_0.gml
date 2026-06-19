// Esto mueve el cañón siempre a la posición exacta del barco
if (instance_exists(mi_canion)) {
    mi_canion.x = x;
    mi_canion.y = y;
}image_xscale = 0.2; // Prueba con 0.2, si sigue grande, intenta con 0.1
image_yscale = 0.2;