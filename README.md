# SportsMatch Mobile

Este repositorio contiene el código fuente de la aplicación móvil de **SportsMatch**, desarrollada en **React Native con Expo**. Permite a los usuarios buscar eventos deportivos, reservar canchas y gestionar su participación en partidos.

## Tecnologías utilizadas

- **React Native + Expo**: Framework para el desarrollo multiplataforma (iOS y Android).
- **Axios**: Cliente HTTP para consumir la API del backend.
- **React Navigation**: Manejo de rutas y navegación en la aplicación.
- **Google Maps API**: Integración de mapas y geolocalización.
- **Mercado Pago SDK**: Procesamiento de pagos seguros.

## Configuración

Para ejecutar la aplicación en modo desarrollo, sigue estos pasos:

1. **Instalar Expo CLI** (si no lo tienes instalado):

   ```sh
   npm install -g expo-cli
   ```

2. **Clonar el repositorio e instalar las dependencias**:

   ```sh
   git clone <URL_DEL_REPO>
   cd sportsmatch-mobile
   npm install
   ```

3. **Crear un archivo `.env`** en el directorio raíz del proyecto con la siguiente configuración:

| Variable                      | Descripción |
|--------------------------------|------------|
| `API_URL`                     | URL del backend de SportsMatch+ |
| `MERCADO_PAGO_ACCESS_TOKEN`    | Token de acceso para pagos con Mercado Pago |

## Ejecución

1. **Iniciar el servidor Expo**:

   ```sh
   npm start
   ```

2. **Ejecutar la aplicación en un emulador o dispositivo**:

   - **Android**: 
     ```sh
     npm run android
     ```
   - **iOS** (requiere macOS):
     ```sh
     npm run ios
     ```
   - **Web**:
     ```sh
     npm run web
     ```

## Funcionalidades principales

✅ **Búsqueda y creación de eventos deportivos**  
✅ **Reserva de canchas y confirmación de disponibilidad**  
✅ **Geolocalización y búsqueda de clubes cercanos**  
✅ **Gestión de pagos mediante Mercado Pago**  
✅ **Interfaz optimizada para iOS y Android**  

---