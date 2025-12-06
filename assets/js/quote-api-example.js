// quote.js에서 localStorage 대신 API 사용하는 예시
// 기존 코드를 이렇게 수정하면 됩니다

// 기존 코드 (localStorage 사용):
/*
function getQuotes() {
    const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveQuote(quote) {
    const quotes = getQuotes();
    // ... 저장 로직
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
}
*/

// 새로운 코드 (API 사용):
import { quotesAPI } from './api.js';

async function getQuotes() {
    try {
        const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
        if (!currentUser) return [];
        
        const quotes = await quotesAPI.getAll({ 
            createdBy: currentUser.email 
        });
        return quotes;
    } catch (error) {
        console.error('견적서 목록 가져오기 실패:', error);
        return [];
    }
}

async function saveQuote(quote) {
    try {
        const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
        if (!currentUser) {
            throw new Error('로그인이 필요합니다');
        }
        
        quote.createdBy = currentUser.email;
        
        if (quote.id) {
            // 기존 견적서 업데이트
            await quotesAPI.update(quote.id, quote);
        } else {
            // 새 견적서 생성
            const result = await quotesAPI.create(quote);
            quote.id = result.id;
        }
        
        return quote;
    } catch (error) {
        console.error('견적서 저장 실패:', error);
        alert('견적서 저장에 실패했습니다: ' + error.message);
        throw error;
    }
}

async function deleteQuote(id) {
    try {
        await quotesAPI.delete(id);
        return true;
    } catch (error) {
        console.error('견적서 삭제 실패:', error);
        alert('견적서 삭제에 실패했습니다: ' + error.message);
        throw error;
    }
}

// 사용 예시:
// 기존: const quotes = getQuotes();
// 새로운: const quotes = await getQuotes();

// 기존: saveQuote(quote);
// 새로운: await saveQuote(quote);

