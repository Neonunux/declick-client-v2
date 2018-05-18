import TEnvironment from '@/env/TEnvironment'
import TObject from '@/objects/tobject/TObject'
import TRuntime from '@/run/TRuntime'
import TUtils from '@/utils/TUtils'

/**
 * I'm making sounds right now. /o/
 * @exports Sound
 */
class Sound extends TObject {
    constructor(name) {
        super(name)

        this.sounds = new Array()
        this.soundSets = new Array()
        this.loop = false
        if (typeof name === 'string') {
            this._addSound(name)
        }
    }

    /**
     * Add a new sound.
     * If "project" is at true, loads it from the project,
     * else loads it from the object.
     * @param {String} name
     * @param {String} set
     * @param {boolean} project
     * @returns {asset}
     */
    addSound(name, set, project) {
        name = TUtils.getString(name)
        let asset
        // add sound only if not already added
        if (typeof this.sounds[name] === 'undefined') {
            try {
                if (project) {
                    // asset from project
                    asset = TEnvironment.getProjectResource(name)
                } else {
                    // asset from object itself
                    asset = this.getResource(name)
                }
                this.sounds[name] = asset
                if (typeof set === 'undefined') {
                    set = ''
                } else {
                    set = TUtils.getString(set)
                }
                if (typeof this.soundSets[set] === 'undefined') {
                    this.soundSets[set] = new Array()
                }
                this.soundSets[set].push(name)
                const loadedAsset = asset

                graphics.load(asset, () => {
                })
            }
            catch (e) {
                throw new Error(this.getMessage('file not found', name))
            }
        } else {
            asset = this.sounds[name]
        }
        return asset
    }

    /**
     * Calls addSoung with project at true.
     * @param {String} name
     * @param {String} set
     */
    _addSound(name, set) {
        this.addSound(name, set, true)
    }

    /**
     * Enable or disable Sound's repetition.
     * @param {Boolean} state
     */
    _loop(state) {
        this.loop = state
    }

    /**
     * Play "name" sound.
     * Repeats it if state is at true.
     * @param {String} name
     */
    _play(name) {
        if (typeof name === 'undefined')
            name = 0
        const asset = this.sounds[name]
        // TODO: wait for loading
        const audio = TRuntime.getGraphics().getAudio()
        audio.play(asset, {loop: this.loop})
    }

    /**
     * Stop "name" sound.
     * @param {String} name
     */
    _stop(name) {
        const asset = this.sounds[name]
        const audio = TRuntime.getGraphics().getAudio()
        audio.stop(asset)
    }
}

Sound.prototype.className = 'Sound'

const graphics = TRuntime.getGraphics()

export default Sound
