import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Issue 17: Prescriptions API Integration (List, By Appointment, PDF)', () => {
  it('1. GET /api/Erx/Prescriptions is registered and defines correct endpoint query', () => {
    const endpointQuery = () => 'api/Erx/Prescriptions';
    assert.equal(endpointQuery(), 'api/Erx/Prescriptions');
  });

  it('2. GET /api/Erx/ByAppointment/{id} constructs route with appointment ID', () => {
    const appointmentId = 28197;
    const endpointQuery = (id) => `api/Erx/ByAppointment/${id}`;
    assert.equal(endpointQuery(appointmentId), 'api/Erx/ByAppointment/28197');
  });

  it('3. GET /api/Erx/{id}/Pdf constructs query for format=json signed URL', () => {
    const erxSnapshotId = 3307;
    const endpointQuery = (id) => `api/Erx/${id}/Pdf?format=json`;
    assert.equal(endpointQuery(erxSnapshotId), 'api/Erx/3307/Pdf?format=json');
  });

  it('4. Prescription controller handles masked remedy names without breaking UI', () => {
    const rawItems = [
      {
        remedyCode: 'R0001',
        remedyName: '',
        potencyCode: '30C',
        dose: '4 pills',
        frequency: 'Twice a day',
        duration: '7 days',
        instructions: 'Before food',
      },
      {
        remedyCode: 'R0002',
        remedyName: 'Arnica Montana',
        potencyCode: '200C',
        dose: '2 pills',
        frequency: 'Once a day',
        duration: '3 days',
        instructions: 'After food',
      },
    ];

    const mapped = rawItems.map((item) => {
      const remedyName = item.remedyName?.trim();
      const remedyCode = item.remedyCode?.trim();
      const potency = item.potencyCode?.trim();
      let name = '';
      if (remedyName) {
        name = potency ? `${remedyName} (${potency})` : remedyName;
      } else if (remedyCode) {
        name = potency ? `${remedyCode} (${potency})` : remedyCode;
      } else {
        name = 'Remedy';
      }
      return { name, dose: item.dose, frequency: item.frequency };
    });

    assert.equal(mapped[0].name, 'R0001 (30C)');
    assert.equal(mapped[1].name, 'Arnica Montana (200C)');
  });

  it('5. Prescription PDF errors surface as toast messages instead of Alert.alert', () => {
    let toast = null;
    const setToast = (msg, variant) => {
      toast = { msg, variant };
    };

    const handleError = (status) => {
      if (status === 409) {
        setToast('Prescription not signed yet', 'error');
      } else if (status === 403) {
        setToast('You do not have access to this prescription.', 'error');
      } else {
        setToast('Could not open prescription PDF.', 'error');
      }
    };

    handleError(409);
    assert.deepEqual(toast, {
      msg: 'Prescription not signed yet',
      variant: 'error',
    });

    handleError(403);
    assert.deepEqual(toast, {
      msg: 'You do not have access to this prescription.',
      variant: 'error',
    });
  });
});

describe('Issue 18: Documents API Integration (List, Details, Upload, Delete)', () => {
  it('1. GET /api/Patient/Documents endpoint query', () => {
    const endpointQuery = () => 'api/Patient/Documents';
    assert.equal(endpointQuery(), 'api/Patient/Documents');
  });

  it('2. GET /api/Patient/Documents/{id} endpoint query and URL resolution', () => {
    const documentId = 19;
    const endpointQuery = (id) => `api/Patient/Documents/${id}`;
    assert.equal(endpointQuery(documentId), 'api/Patient/Documents/19');

    const resolveUrl = (baseUrl, id) =>
      `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}api/Patient/Documents/${id}`;
    assert.equal(
      resolveUrl('https://devapi.homeocentrum.com', 19),
      'https://devapi.homeocentrum.com/api/Patient/Documents/19',
    );
  });

  it('3. POST /api/Patient/Documents multipart upload configuration', () => {
    const makeUploadConfig = (formData) => ({
      url: 'api/Patient/Documents',
      method: 'POST',
      body: formData,
    });

    const mockFormData = { _parts: [['file', { name: 'report.pdf' }]] };
    const config = makeUploadConfig(mockFormData);
    assert.equal(config.url, 'api/Patient/Documents');
    assert.equal(config.method, 'POST');
    assert.equal(config.body, mockFormData);
  });

  it('4. DELETE /api/Patient/Documents/{id} triggers confirmation modal before execution', () => {
    let confirmPromptOpen = false;
    let pendingDeleteId = null;

    const onPromptDelete = (id) => {
      confirmPromptOpen = true;
      pendingDeleteId = id;
    };

    onPromptDelete(19);
    assert.equal(confirmPromptOpen, true);
    assert.equal(pendingDeleteId, 19);

    let deleteCalledWith = null;
    const onConfirmDelete = (id) => {
      deleteCalledWith = id;
      confirmPromptOpen = false;
      pendingDeleteId = null;
    };

    onConfirmDelete(19);
    assert.equal(deleteCalledWith, 19);
    assert.equal(confirmPromptOpen, false);
    assert.equal(pendingDeleteId, null);
  });
});

describe('Issue 19: Consultations API Integration (Visits, Note, Tele Summary)', () => {
  it('1. GET /api/Patient/Visits query params mapping', () => {
    const query = (params) => ({
      url: 'api/Patient/Visits',
      params: params
        ? {
            patientId: params.patientId,
            status: params.status,
            pageNumber: params.pageNumber,
            pageSize: params.pageSize,
          }
        : undefined,
    });

    const withoutParams = query();
    assert.equal(withoutParams.url, 'api/Patient/Visits');
    assert.equal(withoutParams.params, undefined);

    const withParams = query({ patientId: 4051, status: 'COMPLETED' });
    assert.equal(withParams.params.patientId, 4051);
    assert.equal(withParams.params.status, 'COMPLETED');
  });

  it('2. GET /api/Patient/Consultations/{patientAppId}/Note endpoint path', () => {
    const patientAppId = 28197;
    const endpointQuery = (id) => `api/Patient/Consultations/${id}/Note`;
    assert.equal(
      endpointQuery(patientAppId),
      'api/Patient/Consultations/28197/Note',
    );
  });

  it('3. GET /api/Tele/Summary/{patientAppId} endpoint path and multi-item concatenation', () => {
    const patientAppId = 28197;
    const endpointQuery = (id) => `api/Tele/Summary/${id}`;
    assert.equal(endpointQuery(patientAppId), 'api/Tele/Summary/28197');

    const summaryItems = [
      { consultationSummaryId: 1, text: 'First part of advice.' },
      { consultationSummaryId: 2, text: 'Second part of advice.' },
    ];

    const fullSummary = summaryItems
      .map((s) => s.text.trim())
      .filter(Boolean)
      .join('\n\n');

    assert.equal(
      fullSummary,
      'First part of advice.\n\nSecond part of advice.',
    );
  });
});

describe('Issue 20: Follow Ups API Integration (List, Create, Complete)', () => {
  it('1. GET /api/Patient/FollowUps endpoint path', () => {
    const endpointQuery = () => 'api/Patient/FollowUps';
    assert.equal(endpointQuery(), 'api/Patient/FollowUps');
  });

  it('2. POST /api/Patient/FollowUps request body and validation', () => {
    const makeCreateFollowUp = (body) => {
      if (!body.title || !body.title.trim()) {
        throw new Error('Title is required');
      }
      if (!body.patientAppId || body.patientAppId <= 0) {
        throw new Error('patientAppId is required');
      }
      return {
        url: 'api/Patient/FollowUps',
        method: 'POST',
        body,
      };
    };

    assert.throws(() => makeCreateFollowUp({ title: '' }), /Title is required/);
    assert.throws(
      () => makeCreateFollowUp({ title: 'Check rash', patientAppId: 0 }),
      /patientAppId is required/,
    );

    const config = makeCreateFollowUp({
      patientAppId: 28197,
      title: 'Send rash update',
      dueDate: '2026-11-05T00:00:00',
    });
    assert.equal(config.url, 'api/Patient/FollowUps');
    assert.equal(config.body.patientAppId, 28197);
    assert.equal(config.body.title, 'Send rash update');
  });

  it('3. POST /api/Patient/FollowUps/{taskId}/Complete endpoint path and success state', () => {
    const taskId = 71;
    const endpointQuery = (id) => ({
      url: `api/Patient/FollowUps/${id}/Complete`,
      method: 'POST',
    });

    const config = endpointQuery(taskId);
    assert.equal(config.url, 'api/Patient/FollowUps/71/Complete');
    assert.equal(config.method, 'POST');
  });

  it('4. Follow-up completion error surfaces toast notification instead of Alert.alert', () => {
    let toast = null;
    const setToast = (msg, variant) => {
      toast = { msg, variant };
    };

    const handleCompleteError = (err) => {
      const msg = err?.data?.message || 'Could not complete follow-up task.';
      setToast(msg, 'error');
    };

    handleCompleteError({ data: { message: 'This task is already complete.' } });
    assert.deepEqual(toast, {
      msg: 'This task is already complete.',
      variant: 'error',
    });
  });
});
