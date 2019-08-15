from StringIO import StringIO

import pandas as pd

from harvest import Harvest
from domain import Domain

from .stream import init_plot
from django.conf import settings

ENABLE_STREAM_VIZ = settings.ENABLE_STREAM_VIZ

class PlotsNotReadyException(Exception):
    pass


class AcheDashboard(object):

    def __init__(self, crawl):
        self.crawl = crawl
        if self.crawl.crawler != "ache":
            raise ValueError("Crawl must be using the Ache crawler.")
        self.harvest = Harvest(crawl)
        self.domain = Domain(crawl)

    def get_harvest_plot(self):
        # TODO: Remove Pokemon exception catching
        try:
            script, div = self.harvest.create()
        except:
            return [None, None]
        return [script, div]

    def get_domain_plot(self):
        # TODO: Remove Pokemon exception catching
        try:
            script, div = self.domain.create()
        except Exception:
            return [None, None]
        return [script, div]

    def get_relevant_seeds(self):
        # Converts string to StringIO to allow pandas to read it as a file
        seeds = pd.read_csv(StringIO(self.domain.get_relevant_data()),
                           delimiter='\t', header=None,
                           names=['url', 'timestamp'])
        return seeds['url'].to_dict().values()

    def get_plots(self):
        harvest_plot = self.get_harvest_plot()
        domain_plot = self.get_domain_plot()
        if harvest_plot != [None, None]:
            return {
                'scripts': [domain_plot[0], harvest_plot[0]],
                'divs': [domain_plot[1], harvest_plot[1]],
            }
        else:
            return {
                'scripts': None,
                'divs': None,
            }


class NutchDashboard(object):

    def __init__(self, crawl):
        self.crawl = crawl
        if self.crawl.crawler != "nutch":
            raise ValueError("Crawl must be using the Nutch crawler.")

    def get_plots(self):
        # TODO: For simultaneous crawl monitoring need to use unique crawl ids
        if ENABLE_STREAM_VIZ:
            script = init_plot(self.crawl.name)
        else:
            script = None
        return {
            'scripts': [script],
            'divs': [],
        }
