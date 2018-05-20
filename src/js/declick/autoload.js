import TEnvironment from '@/env/TEnvironment'
import TUI from '@/ui/TUI'

export default function () {
    TUI.getEditor().getAceEditor().on('change', () => {
        const program = TUI.getEditor().getProgram()
        if (program.getName() === 'autoload') {
            localStorage.setItem('autoload', TUI.getEditor().getValue())
        }
    })
    
    const code = localStorage.getItem('autoload')
    TUI.newProgram('autoload', code)
}

//