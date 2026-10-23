{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" ] (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        bun-1_4_4 = pkgs.bun.overrideAttrs (
          new: old: {
            version = "1.4.4";
            passthru = old.passthru // {
              sources = {
                "x86_64-linux" = pkgs.fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${new.version}/bun-linux-x64-baseline.zip";
                  hash = "sha256-4ERutVmVdy65iUvrrppr42jZhai5Jx7hJEhvmUbu3XY=";
                };
                "aarch64-linux" = pkgs.fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${new.version}/bun-linux-aarch64.zip";
                  hash = "sha256-uqa7NvUdblhWHgK76oJQOKnfRU9nPW13bou/hvjHhQ4=";
                };
                "aarch64-darwin" = pkgs.fetchurl {
                  url = "https://github.com/oven-sh/bun/releases/download/bun-v${new.version}/bun-darwin-aarch64.zip";
                  hash = "sha256-wkDX8My5DCY6hJ/NsJt+5iYw2SE0jtaq/ahrnVd7xRA=";
                };
              };
            };
            # patch bash completion
            postPatchelf = old.postPatchelf + ''
              substituteInPlace $out/share/bash-completion/completions/bun.bash \
                --replace-fail '( "''${COMPREPLY[*]}" =~ ''${re_comp_word_script} )' \
                               '( -n "''${re_comp_word_script}" && "''${COMPREPLY[*]}" =~ ''${re_comp_word_script} )'
              cat ${./scripts/bun-completion.bash} >> $out/share/bash-completion/completions/bun.bash
            '';
            __intentionallyOverridingVersion = true;
          }
        );
      in
      {
        devShells = {
          default = pkgs.mkShell {
            nativeBuildInputs = [ bun-1_4_4 ];
          };
        };
      }
    );
}
