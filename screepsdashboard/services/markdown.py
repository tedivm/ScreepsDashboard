import markdown
from mdx_gfm import GithubFlavoredMarkdownExtension
from pathlib import Path
from screepsdashboard.services.cache import cache

@cache.cache(expire=120)
def markdown_convert(source_file):
    source = Path(source_file).read_text()
    return markdown.markdown(source, extensions=[GithubFlavoredMarkdownExtension()])
