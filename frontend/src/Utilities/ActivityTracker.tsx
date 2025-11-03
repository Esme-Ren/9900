import { apiCallPost } from './ApiCalls';

class ActivityTracker {
  private sessionId: string;
  private pageStartTime: number;
  private currentPage: string;
  private isTracking: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.pageStartTime = Date.now();
    this.currentPage = window.location.pathname;
    this.initTracking();
    console.log('ActivityTracker initialized with session ID:', this.sessionId);
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private initTracking() {
    if (this.isTracking) return;
    this.isTracking = true;

    // Track page loads
    this.trackPageLoad();

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageLeave();
      } else {
        this.trackPageLoad();
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.trackPageLeave();
    });

    // Track navigation
    window.addEventListener('popstate', () => {
      this.trackPageLeave();
      setTimeout(() => {
        this.trackPageLoad();
      }, 100);
    });

    // Track clicks
    document.addEventListener('click', (e) => {
      this.trackClick(e);
    });

    // Track form inputs
    document.addEventListener('input', (e) => {
      this.trackFormInput(e);
    });

    // Track scroll events (throttled)
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackScroll();
      }, 1000);
    });
  }

  private async trackPageLoad() {
    try {
      this.pageStartTime = Date.now();
      this.currentPage = window.location.pathname;
      
      await this.logBrowserActivity({
        activity_type: 'page_load',
        page_url: window.location.href,
        metadata: {
          referrer: document.referrer || '',
          user_agent: navigator.userAgent || '',
          screen_resolution: `${window.screen.width || 0}x${window.screen.height || 0}`,
          viewport: `${window.innerWidth || 0}x${window.innerHeight || 0}`
        }
      });

      await this.logPageActivity({
        page_url: window.location.href,
        page_title: document.title || '',
        time_spent: 0
      });
    } catch (error) {
      console.error('Error in trackPageLoad:', error);
    }
  }

  private async trackPageLeave() {
    try {
      const timeSpent = Math.floor((Date.now() - this.pageStartTime) / 1000);
      
      await this.logPageActivity({
        page_url: window.location.href,
        page_title: document.title || '',
        time_spent: timeSpent
      });
    } catch (error) {
      console.error('Error in trackPageLeave:', error);
    }
  }

  private async trackClick(event: MouseEvent) {
    try {
      const target = event.target as HTMLElement;
      if (!target) return;

      // 优先使用更短的标识符，并限制长度
      let elementId = target.id || target.getAttribute('data-testid') || target.getAttribute('name');
      
      // 如果没有简短标识符，使用className但限制长度
      if (!elementId && target.className && typeof target.className === 'string') {
        try {
          // 只取第一个类名，避免过长的类名列表
          elementId = target.className.split(' ')[0];
        } catch (error) {
          console.warn('Error processing className:', error);
        }
      }
      
      // 如果还是没有，使用tagName
      if (!elementId) {
        elementId = target.tagName ? target.tagName.toLowerCase() : 'unknown';
      }
      
      // 确保长度不超过数据库限制
      if (elementId && elementId.length > 500) {
        elementId = elementId.substring(0, 500);
      }

      const elementType = target.tagName ? target.tagName.toLowerCase() : 'unknown';

      await this.logBrowserActivity({
        activity_type: 'click',
        element_id: elementId || 'unknown',
        element_type: elementType,
        page_url: window.location.href,
        metadata: {
          x: event.clientX || 0,
          y: event.clientY || 0,
          button: event.button || 0
        }
      });
    } catch (error) {
      console.error('Error in trackClick:', error);
    }
  }

  private async trackFormInput(event: Event) {
    try {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target || !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      // 优先使用更短的标识符，并限制长度
      let elementId = target.id || target.name || target.getAttribute('data-testid');
      
      // 如果没有简短标识符，使用tagName
      if (!elementId) {
        elementId = target.tagName ? target.tagName.toLowerCase() : 'unknown';
      }
      
      // 确保长度不超过数据库限制
      if (elementId && elementId.length > 500) {
        elementId = elementId.substring(0, 500);
      }

      await this.logBrowserActivity({
        activity_type: 'form_input',
        element_id: elementId || 'unknown',
        element_type: target.tagName ? target.tagName.toLowerCase() : 'unknown',
        page_url: window.location.href,
        metadata: {
          field_name: target.name || '',
          field_type: target.type || '',
          value_length: target.value ? target.value.length : 0
        }
      });
    } catch (error) {
      console.error('Error in trackFormInput:', error);
    }
  }

  private async trackScroll() {
    try {
      const scrollY = window.scrollY || 0;
      const maxScroll = (document.documentElement.scrollHeight || 0) - (window.innerHeight || 0);
      const scrollPercentage = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

      await this.logBrowserActivity({
        activity_type: 'scroll',
        page_url: window.location.href,
        metadata: {
          scroll_y: scrollY,
          scroll_percentage: Math.round(scrollPercentage),
          viewport_height: window.innerHeight || 0
        }
      });
    } catch (error) {
      console.error('Error in trackScroll:', error);
    }
  }

  public async trackSearch(searchQuery: string, searchType: string = 'general') {
    try {
      await this.logSearchHistory({
        search_query: searchQuery || '',
        search_type: searchType || 'general'
      });
    } catch (error) {
      console.error('Error in trackSearch:', error);
    }
  }

  public async trackFormActivity(formId: number, activityType: string, fieldName?: string, contentLength: number = 0) {
    try {
      await this.logFormActivity({
        form_id: formId || 0,
        activity_type: activityType || '',
        field_name: fieldName || '',
        content_length: contentLength || 0
      });
    } catch (error) {
      console.error('Error in trackFormActivity:', error);
    }
  }

  private async logSearchHistory(data: any) {
    try {
      console.log('Logging search history:', data);
      const response = await apiCallPost('api/admin/log/search/', {
        ...data,
        session_id: this.sessionId
      }, true);
      console.log('Search history logged successfully:', response);
    } catch (error) {
      console.error('Failed to log search history:', error);
    }
  }

  private async logPageActivity(data: any) {
    try {
      await apiCallPost('api/admin/log/page-activity/', {
        ...data,
        session_id: this.sessionId
      }, true);
    } catch (error) {
      console.error('Failed to log page activity:', error);
    }
  }

  private async logFormActivity(data: any) {
    try {
      await apiCallPost('api/admin/log/form-activity/', {
        ...data,
        session_id: this.sessionId
      }, true);
    } catch (error) {
      console.error('Failed to log form activity:', error);
    }
  }

  private async logBrowserActivity(data: any) {
    try {
      await apiCallPost('api/admin/log/browser-activity/', {
        ...data,
        session_id: this.sessionId
      }, true);
    } catch (error) {
      console.error('Failed to log browser activity:', error);
    }
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public reinitializeSession() {
    this.sessionId = this.generateSessionId();
    console.log('ActivityTracker session reinitialized:', this.sessionId);
  }

  public stopTracking() {
    this.isTracking = false;
    this.trackPageLeave();
  }
}

// Create a singleton instance
const activityTracker = new ActivityTracker();

export default activityTracker; 