import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, GoogleAuthProvider } from 'firebase/auth';
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, query, where, serverTimestamp 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError } from './firebase';
import { CreditCard, FixedBill, Transaction, OperationType } from './types';
import AuthScreen from './components/AuthScreen';
import DashboardHeader from './components/DashboardHeader';
import Dashboard from './components/Dashboard';

export default function App() {
  // Authentication states
  const [user, setUser] = useState<{ displayName: string | null; email: string | null; photoURL: string | null; uid: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // default to light mode as requested

  // Cloud/Local states
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [bills, setBills] = useState<FixedBill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Selected Month/Year
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // 1. Theme handler (Dark mode wrapper)
  useEffect(() => {
    // Check initial user theme preference or use default light mode
    const storedTheme = localStorage.getItem('finance_theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  const handleToggleTheme = () => {
    const nextVal = !isDarkMode;
    setIsDarkMode(nextVal);
    localStorage.setItem('finance_theme', nextVal ? 'dark' : 'light');
  };

  // 2. Track Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid
        });
        setIsGuest(false);
      } else {
        setUser(null);
        // If they are not logged in and didn't trigger Guest Mode, they should see the AuthScreen
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // 3. Database Sync Effect (Real-time Cloud Sync)
  useEffect(() => {
    if (!authChecked || isGuest || !user) {
      return;
    }

    // A. Subscribe to Credit Cards reference
    const cardsPath = 'creditCards';
    const cardsQuery = query(collection(db, cardsPath), where('ownerId', '==', user.uid));
    const unsubCards = onSnapshot(cardsQuery, (snapshot) => {
      const list: CreditCard[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CreditCard);
      });
      setCards(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, cardsPath);
    });

    // B. Subscribe to Fixed Bills reference
    const billsPath = 'fixedBills';
    const billsQuery = query(collection(db, billsPath), where('ownerId', '==', user.uid));
    const unsubBills = onSnapshot(billsQuery, (snapshot) => {
      const list: FixedBill[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as FixedBill);
      });
      setBills(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, billsPath);
    });

    // C. Subscribe to Individual Transactions reference
    const txPath = 'transactions';
    const txQuery = query(collection(db, txPath), where('ownerId', '==', user.uid));
    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Transaction);
      });
      // Sort by transaction date descending
      list.sort((a, b) => b.date.localeCompare(a.date));
      setTransactions(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, txPath);
    });

    // Clean up connections on unmount/user logout
    return () => {
      unsubCards();
      unsubBills();
      unsubTx();
    };
  }, [authChecked, isGuest, user]);

  // 4. LocalStorage Sync Effect (Guest Mode Fallback)
  useEffect(() => {
    if (!isGuest) return;

    // Load static local data
    const localCards = localStorage.getItem('guest_cards');
    const localBills = localStorage.getItem('guest_bills');
    const localTx = localStorage.getItem('guest_transactions');

    if (localCards) setCards(JSON.parse(localCards));
    else setCards([]);

    if (localBills) setBills(JSON.parse(localBills));
    else setBills([]);

    if (localTx) setTransactions(JSON.parse(localTx));
    else setTransactions([]);

  }, [isGuest]);

  // Save changes locally in Guest mode
  const saveGuestData = (type: 'cards' | 'bills' | 'tx', list: any[]) => {
    if (!isGuest) return;
    if (type === 'cards') {
      setCards(list);
      localStorage.setItem('guest_cards', JSON.stringify(list));
    } else if (type === 'bills') {
      setBills(list);
      localStorage.setItem('guest_bills', JSON.stringify(list));
    } else if (type === 'tx') {
      setTransactions(list);
      localStorage.setItem('guest_transactions', JSON.stringify(list));
    }
  };

  // 5. Actions / Operations: Card Functions
  const handleAddCard = async (cardData: Omit<CreditCard, 'id' | 'ownerId' | 'createdAt'>) => {
    if (isGuest) {
      const id = 'local_card_' + Math.floor(Math.random() * 10000000);
      const newCard: CreditCard = {
        id,
        ownerId: 'guest',
        ...cardData,
        createdAt: new Date().toISOString()
      };
      saveGuestData('cards', [...cards, newCard]);
    } else if (user) {
      const cardsPath = 'creditCards';
      try {
        const ref = doc(collection(db, cardsPath));
        const newCard: CreditCard = {
          id: ref.id,
          ownerId: user.uid,
          ...cardData,
          createdAt: serverTimestamp()
        };
        await setDoc(ref, newCard);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, cardsPath);
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (isGuest) {
      const filtered = cards.filter(c => c.id !== cardId);
      saveGuestData('cards', filtered);
      
      // Remove card reference from transactions locally
      const updatedTx = transactions.map(t => t.cardId === cardId ? { ...t, cardId: null } : t);
      saveGuestData('tx', updatedTx);
    } else if (user) {
      const cardsPath = `creditCards/${cardId}`;
      try {
        await deleteDoc(doc(db, 'creditCards', cardId));
        // We'll let the user's transactions keep their information or modify them. 
        // Note: For relational sync, we can optionally nullify cardId in database as well, but standard is deletion of card.
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, cardsPath);
      }
    }
  };

  // 6. Actions / Operations: Bill Functions
  const handleAddBill = async (billData: Omit<FixedBill, 'id' | 'ownerId' | 'createdAt'>) => {
    if (isGuest) {
      const id = 'local_bill_' + Math.floor(Math.random() * 10000000);
      const newBill: FixedBill = {
        id,
        ownerId: 'guest',
        ...billData,
        createdAt: new Date().toISOString()
      };
      saveGuestData('bills', [...bills, newBill]);
    } else if (user) {
      const billsPath = 'fixedBills';
      try {
        const ref = doc(collection(db, billsPath));
        const newBill: FixedBill = {
          id: ref.id,
          ownerId: user.uid,
          ...billData,
          createdAt: serverTimestamp()
        };
        await setDoc(ref, newBill);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, billsPath);
      }
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (isGuest) {
      const filtered = bills.filter(b => b.id !== billId);
      saveGuestData('bills', filtered);
    } else if (user) {
      const billsPath = `fixedBills/${billId}`;
      try {
        await deleteDoc(doc(db, 'fixedBills', billId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, billsPath);
      }
    }
  };

  // 7. Actions / Operations: Transaction Functions
  const handleAddTransaction = async (txData: Omit<Transaction, 'id' | 'ownerId' | 'createdAt'>) => {
    if (isGuest) {
      const id = 'local_tx_' + Math.floor(Math.random() * 10000000);
      const newTx: Transaction = {
        id,
        ownerId: 'guest',
        ...txData,
        createdAt: new Date().toISOString()
      };
      const newList = [newTx, ...transactions].sort((a, b) => b.date.localeCompare(a.date));
      saveGuestData('tx', newList);
    } else if (user) {
      const txPath = 'transactions';
      try {
        const ref = doc(collection(db, txPath));
        const newTx: Transaction = {
          id: ref.id,
          ownerId: user.uid,
          ...txData,
          createdAt: serverTimestamp()
        };
        await setDoc(ref, newTx);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, txPath);
      }
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (isGuest) {
      const filtered = transactions.filter(t => t.id !== txId);
      saveGuestData('tx', filtered);
    } else if (user) {
      const txPath = `transactions/${txId}`;
      try {
        await deleteDoc(doc(db, 'transactions', txId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, txPath);
      }
    }
  };

  // Sign out / Logout function
  const handleLogout = () => {
    if (isGuest) {
      setIsGuest(false);
      setCards([]);
      setBills([]);
      setTransactions([]);
    } else {
      signOut(auth).catch((err) => console.error("Error signing out:", err));
    }
  };

  // Loading barrier during initialization
  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4 font-sans select-none">
        <div className="p-4 bg-emerald-500 rounded-3xl animate-pulse text-white shadow-xl shadow-emerald-500/20">
          <svg className="w-8 h-8 font-extrabold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10" />
            <path d="M3 10V6a2 2 0 0 1 2-2h14" />
          </svg>
        </div>
        <p className="text-sm font-bold tracking-wider text-slate-400 animate-pulse">Sincronizando Banco de Dados...</p>
      </div>
    );
  }

  // Auth Screen if not logged in and not under Guest trial
  if (!user && !isGuest) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <AuthScreen 
          onContinueAsGuest={() => setIsGuest(true)} 
          isDarkMode={isDarkMode} 
        />
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-12">
        {/* Navigation / Control Header */}
        <DashboardHeader 
          user={user}
          isGuest={isGuest}
          onLogout={handleLogout}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={(m, y) => {
            setSelectedMonth(m);
            setSelectedYear(y);
          }}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />

        {/* Dashboard Panels */}
        <Dashboard 
          cards={cards}
          bills={bills}
          transactions={transactions}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
          onAddBill={handleAddBill}
          onDeleteBill={handleDeleteBill}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
    </div>
  );
}
