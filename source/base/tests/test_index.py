from __future__ import unicode_literals

import os
import shutil

from django.conf import settings
from memex.test_utils.unit_test_utils import UnitTestSkeleton, form_errors, get_object
from django.test import TestCase
from django.db import IntegrityError
from django.core.files import File
from django.core.files.uploadedfile import UploadedFile

from base.models import Project, Index

from task_manager.file_tasks import upload_zip


class TestIndex(UnitTestSkeleton):

    @classmethod
    def setUpClass(cls):
        super(TestIndex, cls).setUpClass()
        cls.test_project = Project(
            name="Test Indices",
            description="Test Project Description"
        )
        cls.test_project.save()
        cls.test_index = Index(
            name="Test Index",
            project=cls.test_project,
            uploaded_data=cls.zip_file1(),
        )
        cls.test_index.save()

    @classmethod
    def tearDownClass(cls):
        super(TestIndex, cls).tearDownClass()
        shutil.rmtree(os.path.join(settings.MEDIA_ROOT, "indices", "test-index-post"))
        shutil.rmtree(os.path.join(settings.MEDIA_ROOT, "indices", "test-index"))

    @classmethod
    def zip_file1(self):
        return UploadedFile(open(os.path.join(settings.MEDIA_ROOT, "sample.zip"), 'r'))

    @classmethod
    def zip_file2(self):
        return UploadedFile(open(os.path.join(settings.MEDIA_ROOT, "sample2.zip"), 'r'))

    def slugs(self):
        return {
            "slugs": {
                "project_slug": "test-indices",
            }
        }

    def add_index_slugs(self):
        return {
            "slugs": {
                "project_slug": "test-indices",
                "index_slug": "test-index-post",
            }
        }

    def update_index_slugs(self):
        return {
            "slugs": {
                "project_slug": "test-indices",
                "index_slug": "test-index",
            }
        }

    def add_index_form_data(self):
        return {
            "name": "Test Index Post",
            "project": self.test_project,
            "uploaded_data": self.zip_file1(),
        }

    def update_index_form_data(self):
        return {
            "project": self.test_project,
            "uploaded_data": self.zip_file2(),
        }

    def test_add_index_page(self):
        response = self.get('base:add_index', **self.slugs())
        assert 'base/add_index.html' in response.template_name

    def test_indices_page(self):
        response = self.get('base:indices', **self.slugs())
        assert 'base/indices.html' in response.template_name

    def test_add_index_settings(self):
        """
        Test for index settings page is included in this test because the
        database row does not appear to persist between tests.
        """
        response = self.post('base:add_index', self.add_index_form_data(), **self.slugs())
        assert 'base/project.html' in response.template_name

        response = self.get('base:index_settings', **self.add_index_slugs())
        assert 'base/index_update_form.html' in response.template_name

    def test_verify_unzip(self):
        """
        Test that the unzip function works with zip files that contain files
        other than pdfs.
        """
        assert os.path.exists(
            os.path.join(
                settings.MEDIA_ROOT,
                "indices",
                "test-index-post",
                "data",
                "sample.txt"
            )
        )

    def test_update_index(self):
        """
        Update the index with new files.
        """
        response = self.post('base:index_settings', self.update_index_form_data(),
            **self.update_index_slugs())
        assert 'base/project.html' in response.template_name

        assert not os.path.exists(
            os.path.join(
                settings.MEDIA_ROOT,
                "indices",
                "test-index",
                "data",
                "sample.txt"
            )
        )

        assert os.path.exists(
            os.path.join(
                settings.MEDIA_ROOT,
                "indices",
                "test-index",
                "data",
                "sample2.txt"
            )
        )
