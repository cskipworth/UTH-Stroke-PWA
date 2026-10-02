export function seedSampleExamData() {
  try {
    const existingHistory = JSON.parse(localStorage.getItem('examHistory') || '[]');
    if (Array.isArray(existingHistory) && existingHistory.length > 0) {
      return;
    }

    const sampleExamID = 'sample-jane-doe-demo';
    const now = new Date().toISOString();

    const questionOptions = {
      '1a': [
        { points: 0, text: '0. Alert; keenly responsive.' },
        { points: 1, text: '1. Not alert; but arousable by minor stimulation to obey, answer, or respond.' },
        { points: 2, text: '2. Not alert; requires repeated stimulation to attend.' },
        { points: 2, text: '2. Not alert; obtunded and requires strong or painful stimulation to make movements (not stereotyped).' },
        { points: 3, text: '3. Responds only with reflex motor or autonomic effects, or totally unresponsive, flaccid, and areflexic.' }
      ],
      '1b': [
        { points: 0, text: '0. Answers both questions correctly.' },
        { points: 1, text: '1. Answers one question correctly.' },
        { points: 2, text: '2. Answers neither question correctly.' },
        { points: 1, text: '1. Intubation, orotracheal trauma, severe dysarthria, or language barrier (preventing speech).' },
        { points: 2, text: '2. Aphasic or stuporous patients (can’t comprehend questions).' }
      ],
      '1c': [
        { points: 0, text: '0. Performs both tasks correctly.' },
        { points: 1, text: '1. Performs one task correctly.' },
        { points: 2, text: '2. Performs neither task correctly.' }
      ],
      '2': [
        { points: 0, text: '0. Normal.' },
        { points: 1, text: '1. Partial gaze palsy; can be overcome.' },
        { points: 1, text: '1. Partial gaze palsy; corrects with oculocephalic reflex.' },
        { points: 2, text: '2. Forced deviation, or total gaze paresis is not overcome by the oculocephalic maneuver.' }
      ],
      '3': [
        { points: 0, text: '0. No visual loss.' },
        { points: 1, text: '1. Partial hemianopia.' },
        { points: 1, text: '2. Complete hemianopia.' },
        { points: 2, text: '3. Bilateral hemianopia (blind including cortical blindness).' },
        { points: 3, text: '3. Bilateral blindness.' }
      ],
      '4': [
        { points: 0, text: '0. Normal symmetrical movements.' },
        { points: 1, text: '1. Minor paralysis (flattened nasolabial fold, asymmetry on smiling).' },
        { points: 2, text: '2. Partial paralysis (total or near-total paralysis of lower face).' },
        { points: 3, text: '3. Complete paralysis of one or both sides (absence of facial movement in the upper and lower face).' }
      ],
      '5': [
        { points: 0, text: '0. No drift; limb holds 90 (or 45) degrees for full 10 seconds.' },
        { points: 1, text: '1. Drift; limb holds 90 (or 45) degrees, but drifts down before full 10 seconds; does not hit bed or other support.' },
        { points: 2, text: '2. Some effort against gravity; limb cannot get to or maintain (if cued) 90 (or 45) degrees, drifts down to bed, but has some effort against gravity.' },
        { points: 3, text: '3. No effort against gravity; limb falls.' },
        { points: 4, text: '4. No movement.' },
        { points: 'UN', text: 'UN. Amputation or joint fusion, explain:' }
      ],
      '5a': [
        { points: 0, text: '0. No drift; limb holds 90 (or 45) degrees for full 10 seconds.' },
        { points: 1, text: '1. Drift; limb holds 90 (or 45) degrees, but drifts down before full 10 seconds; does not hit bed or other support.' },
        { points: 2, text: '2. Some effort against gravity; limb cannot get to or maintain (if cued) 90 (or 45) degrees, drifts down to bed, but has some effort against gravity.' },
        { points: 3, text: '3. No effort against gravity; limb falls.' },
        { points: 4, text: '4. No movement.' },
        { points: 'UN', text: 'UN. Amputation or joint fusion, explain:' }
      ],
      '5b': [
        { points: 0, text: '0. No drift; limb holds 90 (or 45) degrees for full 10 seconds.' },
        { points: 1, text: '1. Drift; limb holds 90 (or 45) degrees, but drifts down before full 10 seconds; does not hit bed or other support.' },
        { points: 2, text: '2. Some effort against gravity; limb cannot get to or maintain (if cued) 90 (or 45) degrees, drifts down to bed, but has some effort against gravity.' },
        { points: 3, text: '3. No effort against gravity; limb falls.' },
        { points: 4, text: '4. No movement.' },
        { points: 'UN', text: 'UN. Amputation or joint fusion, explain:' }
      ],
      '6a': [
        { points: 0, text: '0. No drift; leg holds 30-degree position for full 5 seconds.' },
        { points: 1, text: '1. Drift; leg falls by the end of the 5-second period but does not hit the bed.' },
        { points: 2, text: '2. Some effort against gravity; leg falls to bed by 5 seconds but has some effort against gravity.' },
        { points: 3, text: '3. No effort against gravity; leg falls to bed immediately.' },
        { points: 4, text: '4. No movement.' },
        { points: 'UN', text: 'UN. Amputation or joint fusion, explain:' }
      ],
      '6b': [
        { points: 0, text: '0. No drift; leg holds 30-degree position for full 5 seconds.' },
        { points: 1, text: '1. Drift; leg falls by the end of the 5-second period but does not hit the bed.' },
        { points: 2, text: '2. Some effort against gravity; leg falls to bed by 5 seconds but has some effort against gravity.' },
        { points: 3, text: '3. No effort against gravity; leg falls to bed immediately.' },
        { points: 4, text: '4. No movement.' },
        { points: 'UN', text: 'UN. Amputation or joint fusion, explain:' }
      ],
      '7': [
        { points: 0, text: '0. Absent.' },
        { points: 1, text: '1. Present in one limb.' },
        { points: 2, text: '2. Present in two limbs.' },
        { points: 'UN', text: 'UN. Amputation or joint fusion, explain.' }
      ],
      '8': [
        { points: 0, text: '0. Normal; no sensory loss.' },
        { points: 1, text: '1. Mild-to-moderate sensory loss; patient feels pinprick is less sharp or is dull on the affected side; or there is a loss of superficial pain with pinprick, but patient is aware of being touched.' },
        { points: 2, text: '2. Severe or total sensory loss; patient is not aware of being touched in the face, arm, and leg.' }
      ],
      '9': [
        { points: 0, text: '0. No aphasia; normal.' },
        { points: 1, text: '1. Mild-to-moderate aphasia; some obvious loss of fluency or facility of comprehension, without significant limitation on ideas expressed or form of expression. Reduction of speech and/or comprehension, however, makes conversation difficult or impossible. For example, in conversation about provided materials, examiner can identify picture or naming card content from patient’s response.' },
        { points: 2, text: '2. Severe aphasia; all communication is through fragmentary expression; great need for inference, questioning, and guessing by the listener. Range of information that can be exchanged is limited; listener carries burden of communication. Examiner cannot identify materials provided from patient response.' },
        { points: 3, text: '3. Mute, global aphasia; no usable speech or auditory comprehension.' }
      ],
      '10': [
        { points: 0, text: '0. Normal.' },
        { points: 1, text: '1. Mild-to-moderate dysarthria; patient slurs at least some words and, at worst, can be understood with some difficulty.' },
        { points: 2, text: '2. Severe dysarthria; patient\'s speech is so slurred as to be unintelligible in the absence of or out of proportion to any dysphasia, or is mute/anarthric.' },
        { points: 'UN', text: 'UN. Intubated or other physical barrier, explain:' }
      ],
      '11': [
        { points: 0, text: '0. No abnormality.' },
        { points: 1, text: '1. Visual, tactile, auditory, spatial, or personal inattention, or extinction to bilateral simultaneous stimulation in one of the sensory modalities.' },
        { points: 2, text: '2. Profound hemi-inattention or extinction to more than one modality; does not recognize own hand or orients to only one side of space.' }
      ]
    };

    const forcedUnQuestions = ['7', '10', '5b', '6a', '6b'];

    const sampleAnswers = Object.fromEntries(
      Object.entries(questionOptions).map(([questionId, options]) => {
        let selectedOption;

        if (forcedUnQuestions.includes(questionId)) {
          selectedOption = options.find((option) => option.points === 'UN') || options[Math.floor(Math.random() * options.length)];
        } else {
          selectedOption = options[Math.floor(Math.random() * options.length)];
        }

        const answerEntry = {
          points: selectedOption.points,
          text: selectedOption.text,
          timestamp: now,
          exam: 'SPA-NIHSS'
        };

        if (selectedOption.points === 'UN') {
          answerEntry['un-reason-text'] = "Here's some sample custom text.";
        }

        return [questionId, answerEntry];
      })
    );

    const totalScore = Object.values(sampleAnswers).reduce((sum, answer) => {
      const numericPoints = Number(answer.points);
      return sum + (Number.isFinite(numericPoints) ? numericPoints : 0);
    }, 0);

    const sampleExam = {
      examID: sampleExamID,
      examName: 'SPA-NIHSS',
      completedAt: now,
      totalScore,
      answers: sampleAnswers
    };

    localStorage.setItem('examHistory', JSON.stringify([sampleExam]));
    localStorage.setItem('examMetadata', JSON.stringify({
      [sampleExamID]: {
        examDate: new Date(now).toISOString().slice(0, 19).replace('T', ' '),
        patientName: 'Jane Doe',
        patientID: 'JD-001',
        dateOfBirth: '',
        lastKnownWell: '',
        nihssScore: totalScore,
        modifiedRankin: '',
        interval: '',
        location: '',
        notes: 'Sample exam data for demonstration. Click "Edit" to modify this exam and see how the app behaves with different inputs.',
      }
    }));

    localStorage.removeItem('selectedModifiedRankin');
  } catch (error) {
    console.error('Failed to seed sample exam data:', error);
  }
}
