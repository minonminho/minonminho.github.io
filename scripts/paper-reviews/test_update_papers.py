import importlib.util
import io
import unittest
import urllib.error
from datetime import date
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('papers', Path(__file__).with_name('update-papers.py'))
papers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(papers)

class FeedTests(unittest.TestCase):
    def test_daily_uses_only_date(self):
        with patch.object(papers, 'request_text', return_value='[]') as request:
            papers.fetch_feed('daily', '2026-11-01', 50)
        self.assertEqual(request.call_args.args[0], papers.HF_API + '?date=2026-11-01')

    def test_weekend_falls_back_to_dated_list(self):
        with patch.object(papers, 'fetch_feed', side_effect=[[], [], [{'paper': {'id': '1'}}]]) as fetch:
            rows, period = papers.available_feed('daily', date(2026, 11, 1), 50)
        self.assertEqual(period, '2026-10-30')
        self.assertEqual(len(rows), 1)
        self.assertEqual(fetch.call_count, 3)

    def test_no_undated_fallback(self):
        with patch.object(papers, 'fetch_feed', return_value=[]) as fetch:
            with self.assertRaisesRegex(RuntimeError, 'no dated Daily Papers'):
                papers.available_feed('daily', date(2026, 11, 1), 50)
        self.assertEqual(fetch.call_count, 8)

    def test_400_reports_body_without_retry(self):
        error = urllib.error.HTTPError('https://example.com', 400, 'Bad Request', {}, io.BytesIO(b'invalid date'))
        with patch.object(papers.urllib.request, 'urlopen', side_effect=error) as request:
            with self.assertRaisesRegex(RuntimeError, 'HTTP 400.*invalid date'):
                papers.request_text('https://example.com')
        self.assertEqual(request.call_count, 1)

    def test_transient_503_retries(self):
        def error():
            return urllib.error.HTTPError('https://example.com', 503, 'Unavailable', {}, io.BytesIO(b'try later'))
        with patch.object(papers.urllib.request, 'urlopen', side_effect=[error(), error(), error()]) as request, patch.object(papers.time, 'sleep'):
            with self.assertRaisesRegex(RuntimeError, 'HTTP 503'):
                papers.request_text('https://example.com')
        self.assertEqual(request.call_count, 3)

if __name__ == '__main__':
    unittest.main()
