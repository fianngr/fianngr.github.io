import { storyPresenter } from '../presenter/storyPresenter.js';
import { saveStoryOffline } from '../db.js';

export const AddStoryView = () => {
    let stream;
    let selectedLat = null;
    let selectedLon = null;
    let formSubmitListener;

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            console.log("Kamera dimatikan");
        }
    };

    const html = `
        <div class="add-story-container">
            <h2>Add a New Story</h2>
            <form id="story-form" class="fade-in">
                <label for="description">Description</label>
                <textarea id="description" name="description" placeholder="Describe your story..." required></textarea>

                <div class="photo-section">
                    <label>Take a Photo</label>
                    <video id="camera" autoplay playsinline style="width: 100%; max-width: 300px;"></video>
                    <button type="button" id="take-photo">Take Photo</button>
                    <canvas id="photo-preview" style="display:none;"></canvas>
                </div>

                <div class="map-section">
                    <label>Select Location</label>
                    <div id="map" style="height: 300px;"></div>
                    <p>Latitude: <span id="lat">-</span>, Longitude: <span id="lon">-</span></p>
                </div>

                <div class="button-group">
                    <button type="button" id="back-button">← Kembali ke Konten Utama</button>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    `;

    setTimeout(async () => {
        const video = document.getElementById('camera');
        const canvas = document.getElementById('photo-preview');
        const takePhotoBtn = document.getElementById('take-photo');
        const form = document.getElementById('story-form');

        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
        } catch (err) {
            alert('Camera access failed: ' + err.message);
        }

        takePhotoBtn.addEventListener('click', () => {
            canvas.width = 360;
            canvas.height = 360;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.style.display = 'block';
        });

        const mapContainer = document.getElementById('map');
        if (!mapContainer._leaflet_id) {
            const map = L.map(mapContainer).setView([-6.2, 106.8], 10);
            let marker;
            L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=7BXPo4DtwET5hku94tQR', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            map.on('click', (e) => {
                selectedLat = e.latlng.lat;
                selectedLon = e.latlng.lng;
                document.getElementById('lat').innerText = selectedLat.toFixed(5);
                document.getElementById('lon').innerText = selectedLon.toFixed(5);

                if (marker) map.removeLayer(marker);
                marker = L.marker([selectedLat, selectedLon]).addTo(map);
            });
        }

        document.getElementById('back-button').addEventListener('click', () => {
            stopCamera();
            window.location.hash = '/';
        });

        window.addEventListener('hashchange', stopCamera);

        formSubmitListener = async (e) => {
            e.preventDefault();
            const description = document.getElementById('description').value;

            const imageBlob = await new Promise(resolve => {
                canvas.toBlob(blob => resolve(blob), 'image/jpeg');
            });

            if (!description || !imageBlob || selectedLat === null || selectedLon === null) {
                alert('Deskripsi, foto, dan lokasi wajib diisi.');
                return;
            }

            if (!navigator.onLine) {
                await saveStoryOffline({
                    description,
                    photo: imageBlob,
                    lat: selectedLat,
                    lon: selectedLon
                });

                alert('Kamu sedang offline. Cerita disimpan dan akan dikirim saat online.');
                stopCamera();
                window.removeEventListener('hashchange', stopCamera);
                form.removeEventListener('submit', formSubmitListener);
                window.location.hash = '#/';
                return;
            }

            try {
                await storyPresenter.createStory(description, imageBlob, selectedLat, selectedLon);
                alert(`Anda telah membuat story baru dengan deskripsi: ${description}`);
                stopCamera();
                window.removeEventListener('hashchange', stopCamera);
                form.removeEventListener('submit', formSubmitListener);
                window.location.hash = '#/';
            } catch (error) {
                alert('Gagal menambahkan story: ' + error.message);
                form.removeEventListener('submit', formSubmitListener);
            }
        };

        form.removeEventListener('submit', formSubmitListener);
        form.addEventListener('submit', formSubmitListener);

    }, 0);

    return html;
};
