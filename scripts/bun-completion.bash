
# appended to bun's generated completion: also offer directories and runnable
# files for `bun <word>` and `bun run <word>`, which upstream doesn't
_bun_completions_with_files() {
    _bun_completions "$@"

    local cur="${COMP_WORDS[COMP_CWORD]}"
    [[ "${cur}" == -* ]] && return
    (( COMP_CWORD == 1 )) || { (( COMP_CWORD == 2 )) && [[ "${COMP_WORDS[1]}" == "run" ]]; } || return

    local f IFS=$'\n'
    for f in $(compgen -f -- "${cur}"); do
        if [[ -d "${f}" || "${f}" =~ \.([cm]?[jt]s|[jt]sx)$ ]]; then
            COMPREPLY+=( "${f}" )
        fi
    done
    compopt -o filenames
}

complete -F _bun_completions_with_files bun