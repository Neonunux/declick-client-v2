import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TObject from '@/objects/tobject/TObject'
import TRuntime from '@/run/TRuntime'
import TCanvas from '@/ui/TCanvas'
import TUtils from '@/utils/TUtils'

class Video extends TObject {
    constructor(name) {
        super(name)



        //$("video").attr("type", "video/mp4");

        $('video').draggable()
        $('video').append('<source src="http://localhost/declick-client/images/minions.mp4" type="video/mp4" style="width: 500px; height: 500px;"></source>')
        //$("video").attr("src", TUtils.getString("minions.mp4"));
        //"assets/minions.mp4"
        this.domVideo = document.getElementById('tvideo')
        this.domVideo.addEventListener('canplay', e => {
            console.log('peut être lue !!')
        })


        this.video = new Array()
        this.videoSets = new Array()
        this.loop = false
        if (typeof name === 'string') {
            this._addVideo(name)
        }
    }

    addVideo(name, set, project) {
        name = TUtils.getString(name)
        let asset
        // add video only if not already added
        if (typeof this.video[name] === 'undefined') {
            try {
                if (project) {
                    // asset from project
                    asset = TEnvironment.getProjectResource(name)
                } else {
                    // asset from object itself
                    asset = this.getResource(name)
                }
                this.video[name] = asset
                if (typeof set === 'undefined') {
                    set = ''
                } else {
                    set = TUtils.getString(set)
                }
                if (typeof this.videoSets[set] === 'undefined') {
                    this.videoSets[set] = new Array()
                }
                this.videoSets[set].push(name)
                const loadedAsset = asset
                graphics.load(asset, () => {
                })
            }
            catch (e) {
                throw new Error(this.getMessage('file not found', name))
            }
        } else {
            asset = this.video[name]
        }
        return asset
    }

    _addVideo(name, set) {
        this.addVideo(name, set, true)
    }

    _loop(state) {
        this.domVideo.loop = state
    }

    _play(name) {
        const asset = this.video[name]

        this.domVideo.play()
    }

    _pause() {
        this.domVideo.pause()
    }

    _displayControls(state) {
        if (state)
            {$(this.domVideo).attr('controls', true)}
        else
            {$(this.domVideo).removeAttr('controls')}
    }

    _mute(state) {
        this.domVideo.muted = state
    }

    _stop(name) {
        const asset = this.video[name]
        this.qAudio.stop(asset)
    }
}

Video.prototype.className = 'Video'

//var tInstance = new Tracking();
const graphics = TRuntime.getGraphics()

const tInstance = new Object()
Video.prototype.qInstance = tInstance

export default Video
