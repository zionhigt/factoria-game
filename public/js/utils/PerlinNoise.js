/**
 * Générateur de Perlin Noise 2D
 * Reproductible avec seed, multi-octave, paramétrable
 */
class PerlinNoise {
    constructor(seed = 0) {
        this.seed = seed;
        this.perm = this._buildPermutationTable(seed);
    }
    
    /**
     * Construit la table de permutation (reproductible avec seed)
     */
    _buildPermutationTable(seed) {
        const p = [];
        
        // Générer 256 valeurs uniques
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        
        // Shuffle avec seed (Fisher-Yates seeded)
        let random = this._seededRandom(seed);
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        
        // Doubler pour éviter overflow
        return p.concat(p);
    }
    
    /**
     * Random reproductible avec seed
     */
    _seededRandom(seed) {
        let state = seed;
        return function() {
            state = (state * 9301 + 49297) % 233280;
            return state / 233280;
        };
    }
    
    /**
     * Fonction de fade (smoothstep amélioré)
     */
    _fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    /**
     * Interpolation linéaire
     */
    _lerp(a, b, t) {
        return a + t * (b - a);
    }
    
    /**
     * Calcul du gradient (produit scalaire)
     */
    _grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : (h === 12 || h === 14 ? x : 0);
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    /**
     * Perlin Noise 2D brut (retourne valeur entre -1 et 1)
     */
    noise(x, y) {
        // Coordonnées de la cellule
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        // Position relative dans la cellule
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        // Fade curves
        const u = this._fade(x);
        const v = this._fade(y);
        
        // Hash des 4 coins
        const aa = this.perm[this.perm[X] + Y];
        const ab = this.perm[this.perm[X] + Y + 1];
        const ba = this.perm[this.perm[X + 1] + Y];
        const bb = this.perm[this.perm[X + 1] + Y + 1];
        
        // Interpolation des gradients
        return this._lerp(
            this._lerp(
                this._grad(aa, x, y),
                this._grad(ba, x - 1, y),
                u
            ),
            this._lerp(
                this._grad(ab, x, y - 1),
                this._grad(bb, x - 1, y - 1),
                u
            ),
            v
        );
    }
    
    /**
     * Perlin Noise normalisé (retourne valeur entre 0 et 1)
     */
    get(x, y) {
        return (this.noise(x, y) + 1) / 2;
    }
    
    /**
     * Multi-octave noise (Fractal Brownian Motion)
     * 
     * @param {number} x - Position X
     * @param {number} y - Position Y
     * @param {number} octaves - Nombre de passes (détail) [1-8]
     * @param {number} persistence - Amplitude de chaque octave [0-1]
     * @param {number} lacunarity - Fréquence de chaque octave [1-4]
     * @param {number} scale - Zoom global [0.001-1]
     */
    octave(x, y, octaves = 4, persistence = 0.5, lacunarity = 2, scale = 0.01) {
        let total = 0;
        let frequency = scale;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        
        // Normaliser entre 0 et 1
        return (total / maxValue + 1) / 2;
    }
}

export default PerlinNoise;