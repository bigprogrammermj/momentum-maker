import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { sendFailureEmail } from '../services/email';
import { clearQuizStartTimer } from '../services/alarm';
import { navigate } from '../services/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type QuizScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Quiz'>;

interface Question {
  id: number;
  text: string;
  answers: string[];
  correctAnswerIndex: number;
}

export function QuizScreen() {
  const navigation = useNavigation<QuizScreenNavigationProp>();
  const [timeLeft, setTimeLeft] = useState(60); // 1 Minute
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [progressAnimation] = useState(new Animated.Value(1));
  const [quizFailed, setQuizFailed] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);
  const isMounted = React.useRef(true);
  const isNavigating = React.useRef(false);
  const emailLock = React.useRef(false);

  // Lade Fragen
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const savedQuestions = await AsyncStorage.getItem('quizQuestions');
        if (savedQuestions) {
          const loadedQuestions = JSON.parse(savedQuestions);
          setQuestions(loadedQuestions);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        // Bei Fehler: Navigiere zurück
        navigation.goBack();
      }
    };
    loadQuestions();
  }, []);

  // Cleanup-Funktion
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);

  // Komponente wird unmountet
  useEffect(() => {
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Navigation-Handler
  const navigateToResult = useCallback((success: boolean) => {
    if (!isMounted.current || isNavigating.current) return;
    isNavigating.current = true;
    navigate('Result', { success });
  }, []);

  // E-Mail-Versand-Funktion mit Lock
  const sendEmail = useCallback(async () => {
    // Prüfe ob E-Mail bereits gesendet, im Versand oder Lock aktiv
    if (emailSent || !isMounted.current || emailLock.current || isEmailSending) return false;
    
    try {
      // Markiere E-Mail als "wird gesendet"
      setIsEmailSending(true);
      // Setze Lock
      emailLock.current = true;
      
      // Sende E-Mail
      await sendFailureEmail();
      
      // Markiere als gesendet
      setEmailSent(true);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    } finally {
      // Löse Lock und setze Sending-Status zurück
      emailLock.current = false;
      setIsEmailSending(false);
    }
  }, [emailSent, isEmailSending]);

  // Timer-Logik
  useEffect(() => {
    if (!isMounted.current || quizFailed || questions.length === 0) {
      cleanup();
      return;
    }

    clearQuizStartTimer();

    let isHandlingTimeout = false;

    // Starte Timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1 && isMounted.current && !isNavigating.current && !isHandlingTimeout) {
          isHandlingTimeout = true;
          cleanup();
          setQuizFailed(true);
          
          // Sofort auf 0 setzen um weitere Timer-Aufrufe zu verhindern
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Sende E-Mail nur wenn die Zeit abgelaufen ist und noch keine gesendet wird
          if (!emailSent && !isEmailSending && !emailLock.current) {
            sendEmail().then(() => {
              if (isMounted.current) {
                navigateToResult(false);
              }
            });
          } else {
            navigateToResult(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Starte Animation
    animationRef.current = Animated.timing(progressAnimation, {
      toValue: 0,
      duration: 60000, // 1 Minute
      useNativeDriver: false,
    });
    animationRef.current.start();

    return cleanup;
  }, [cleanup, quizFailed, questions.length, sendEmail, navigateToResult, emailSent, isEmailSending]);

  // Answer-Handler
  const handleAnswer = useCallback(async (answerIndex: number) => {
    if (!isMounted.current || selectedAnswer !== null || quizFailed || isNavigating.current) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
    setSelectedAnswer(answerIndex);

    if (isCorrect) {
      const newCorrectAnswers = correctAnswers + 1;
      setCorrectAnswers(newCorrectAnswers);
      
      // Warte 1 Sekunde bevor zur nächsten Frage
      setTimeout(() => {
        if (newCorrectAnswers === questions.length) {
          // Alle Fragen richtig beantwortet
          cleanup();
          navigateToResult(true);
        } else if (currentQuestionIndex < questions.length - 1) {
          // Nächste Frage
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer(null);
        }
      }, 1000);
    } else {
      // Bei falscher Antwort: Zurück zur ersten Frage
      setTimeout(() => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setCorrectAnswers(0);
      }, 1000);
    }
  }, [currentQuestionIndex, questions, selectedAnswer, quizFailed, correctAnswers, navigateToResult, cleanup]);

  // Formatiere Zeit
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>LADE QUIZ...</Text>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>FRAGE {currentQuestionIndex + 1}/{questions.length}</Text>
        <Text style={styles.statsText}>RICHTIG: {correctAnswers}/{questions.length}</Text>
      </View>

      <Text style={styles.questionText}>{currentQuestion.text}</Text>

      <View style={styles.answersContainer}>
        {currentQuestion.answers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => selectedAnswer === null && handleAnswer(index)}
            style={[
              styles.answerButton,
              selectedAnswer === index && (
                index === currentQuestion.correctAnswerIndex
                  ? styles.correctAnswer
                  : styles.wrongAnswer
              )
            ]}
            disabled={selectedAnswer !== null}
          >
            <Text style={[
              styles.answerText,
              selectedAnswer === index && (
                index === currentQuestion.correctAnswerIndex
                  ? styles.correctAnswerText
                  : styles.wrongAnswerText
              )
            ]}>
              {answer}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 32,
  },
  loadingText: {
    fontSize: 24,
    color: '#FF4444',
    textAlign: 'center',
    fontFamily: 'DSEG7Classic-Regular',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FF4444',
    borderRadius: 4,
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  timeText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#FF4444',
    fontFamily: 'DSEG7Classic-Regular',
    fontSize: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statsText: {
    color: '#FF4444',
    fontFamily: 'DSEG7Classic-Regular',
    fontSize: 16,
  },
  questionText: {
    fontSize: 24,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'DSEG7Classic-Regular',
  },
  answersContainer: {
    flex: 1,
    gap: 16,
  },
  answerButton: {
    height: 64,
    backgroundColor: '#2D1E1E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerText: {
    fontSize: 20,
    color: '#FF4444',
    fontFamily: 'DSEG7Classic-Regular',
  },
  correctAnswer: {
    backgroundColor: '#1E2D1E',
    borderColor: '#98FB98',
    borderWidth: 1,
  },
  wrongAnswer: {
    backgroundColor: '#2D1E1E',
    borderColor: '#FF4444',
    borderWidth: 1,
  },
  correctAnswerText: {
    color: '#98FB98',
  },
  wrongAnswerText: {
    color: '#FF4444',
  },
}); 