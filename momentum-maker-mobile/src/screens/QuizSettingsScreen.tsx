import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type QuizSettingsNavigationProp = StackNavigationProp<RootStackParamList, 'QuizSettings'>;

interface Question {
  id: number;
  text: string;
  answers: string[];
  correctAnswerIndex: number;
}

type ScreenMode = 'menu' | 'view' | 'edit';

export function QuizSettingsScreen() {
  const navigation = useNavigation<QuizSettingsNavigationProp>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [screenMode, setScreenMode] = useState<ScreenMode>('menu');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [tempQuestions, setTempQuestions] = useState<Question[]>([
    {
      id: 1,
      text: '',
      answers: ['', '', '', ''],
      correctAnswerIndex: 0
    },
    {
      id: 2,
      text: '',
      answers: ['', '', '', ''],
      correctAnswerIndex: 0
    },
    {
      id: 3,
      text: '',
      answers: ['', '', '', ''],
      correctAnswerIndex: 0
    }
  ]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const savedQuestions = await AsyncStorage.getItem('quizQuestions');
      if (savedQuestions) {
        const loadedQuestions = JSON.parse(savedQuestions);
        setQuestions(loadedQuestions);
        setTempQuestions(loadedQuestions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const saveQuestions = async () => {
    try {
      const isComplete = tempQuestions.every(q => 
        q.text && q.answers.every(a => a) && q.answers.length === 4
      );

      if (!isComplete) {
        // TODO: Zeige Fehlermeldung
        return;
      }

      await AsyncStorage.setItem('quizQuestions', JSON.stringify(tempQuestions));
      setQuestions(tempQuestions);
      setScreenMode('menu');
    } catch (error) {
      console.error('Error saving questions:', error);
    }
  };

  const handleNextQuestion = () => {
    const currentQuestion = tempQuestions[currentQuestionIndex];
    
    if (!currentQuestion.text || currentQuestion.answers.some(answer => !answer)) {
      // TODO: Zeige Fehlermeldung
      return;
    }

    if (currentQuestionIndex < 2) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const startEditing = () => {
    setScreenMode('edit');
    setCurrentQuestionIndex(-1);
  };

  const currentQuestion = tempQuestions[currentQuestionIndex];

  const updateCurrentQuestion = (updates: Partial<Question>) => {
    const updatedQuestions = [...tempQuestions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      ...updates
    };
    setTempQuestions(updatedQuestions);
  };

  const saveCurrentQuestion = async () => {
    try {
      const currentQuestion = tempQuestions[currentQuestionIndex];
      if (!currentQuestion.text || currentQuestion.answers.some(a => !a)) {
        // TODO: Zeige Fehlermeldung
        return;
      }

      await AsyncStorage.setItem('quizQuestions', JSON.stringify(tempQuestions));
      setQuestions(tempQuestions);
      setCurrentQuestionIndex(-1);
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const renderMenuMode = () => (
    <View style={styles.content}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollContent}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setScreenMode('view')}
        >
          <Text style={styles.buttonText}>QUIZ ANZEIGEN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={startEditing}
        >
          <Text style={styles.buttonText}>QUIZ BEARBEITEN</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderViewMode = () => (
    <View style={styles.content}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setScreenMode('menu')}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollContent}>
        {questions.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.label}>FRAGE {index + 1}</Text>
            <View style={styles.questionBox}>
              <Text style={styles.questionText}>{question.text}</Text>
            </View>
            
            <Text style={styles.label}>RICHTIGE ANTWORT</Text>
            <View style={styles.answerBox}>
              <Text style={[styles.answerText, styles.correctAnswerText]}>
                {question.answers[question.correctAnswerIndex]}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderEditMode = () => (
    <View style={styles.content}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setScreenMode('menu')}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollContent}>
        {tempQuestions.map((question, index) => (
          <View key={index} style={styles.questionSection}>
            <TouchableOpacity
              style={[
                styles.questionSelectButton,
                currentQuestionIndex === index && styles.questionSelectButtonActive
              ]}
              onPress={() => setCurrentQuestionIndex(
                currentQuestionIndex === index ? -1 : index
              )}
            >
              <Text style={styles.buttonText}>FRAGE {index + 1}</Text>
            </TouchableOpacity>

            {currentQuestionIndex === index && (
              <View style={styles.questionEditContainer}>
                <TextInput
                  style={styles.input}
                  value={question.text}
                  onChangeText={(text) => updateCurrentQuestion({ text })}
                  placeholder="Gib deine Frage ein..."
                  placeholderTextColor="#666"
                />

                {question.answers.map((answer, answerIndex) => (
                  <View key={answerIndex} style={styles.answerContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        answerIndex === question.correctAnswerIndex && styles.correctAnswer
                      ]}
                      value={answer}
                      onChangeText={(text) => {
                        const newAnswers = [...question.answers];
                        newAnswers[answerIndex] = text;
                        updateCurrentQuestion({ answers: newAnswers });
                      }}
                      placeholder={`Antwort ${answerIndex + 1}`}
                      placeholderTextColor="#666"
                    />
                    <TouchableOpacity
                      style={[
                        styles.correctButton,
                        answerIndex === question.correctAnswerIndex && styles.correctButtonActive
                      ]}
                      onPress={() => updateCurrentQuestion({ correctAnswerIndex: answerIndex })}
                    >
                      <Text style={styles.correctButtonText}>✓</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]}
                  onPress={saveCurrentQuestion}
                >
                  <Text style={styles.buttonText}>FRAGE {index + 1} SPEICHERN</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderContent = () => {
    switch (screenMode) {
      case 'menu':
        return renderMenuMode();
      case 'view':
        return renderViewMode();
      case 'edit':
        return renderEditMode();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>QUIZ SETTINGS</Text>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: 32,
  },
  title: {
    fontSize: 28,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'DSEG7Classic-Regular',
  },
  content: {
    flex: 1,
  },
  questionContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    color: '#FF4444',
    marginBottom: 8,
    fontFamily: 'DSEG7Classic-Regular',
  },
  input: {
    backgroundColor: '#2D1E1E',
    color: '#FF4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: 'DSEG7Classic-Regular',
  },
  questionBox: {
    backgroundColor: '#2D1E1E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  questionText: {
    color: '#FF4444',
    fontSize: 16,
    fontFamily: 'DSEG7Classic-Regular',
  },
  answerBox: {
    backgroundColor: '#2D1E1E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  answerText: {
    color: '#FF4444',
    fontSize: 16,
    fontFamily: 'DSEG7Classic-Regular',
  },
  correctAnswerText: {
    color: '#98FB98',
    fontSize: 16,
    fontFamily: 'DSEG7Classic-Regular',
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  correctButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2D1E1E',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  correctButtonActive: {
    backgroundColor: '#FF4444',
  },
  correctButtonText: {
    color: '#FFF',
    fontSize: 20,
  },
  correctAnswer: {
    borderColor: '#FF4444',
    borderWidth: 2,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  navigationButton: {
    flex: 1,
  },
  button: {
    width: '100%',
    height: 64,
    backgroundColor: '#2D1E1E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 24,
    color: '#FF4444',
    fontFamily: 'DSEG7Classic-Regular',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 16,
    zIndex: 1,
  },
  backButtonText: {
    color: '#FF4444',
    fontSize: 32,
    fontFamily: 'DSEG7Classic-Regular',
  },
  scrollContent: {
    flex: 1,
    marginTop: 48,
  },
  questionSection: {
    marginBottom: 16,
  },
  questionSelectButton: {
    width: '100%',
    height: 64,
    backgroundColor: '#2D1E1E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionSelectButtonActive: {
    backgroundColor: '#3D2E2E',
    borderColor: '#FF4444',
    borderWidth: 2,
  },
  questionEditContainer: {
    backgroundColor: '#2D1E1E',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#3D2E2E',
  },
  finalSaveButton: {
    marginTop: 32,
    backgroundColor: '#FF4444',
  },
}); 