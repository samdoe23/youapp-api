format:
    #!/usr/bin/env nu
    for $f in (git ls-files --cached --others --exclude-standard | split row "\n") {
      let res = cat $f | prettierd $f | complete
      if $res.exit_code == 0 { print $"Formatted ($f)"}
    }
