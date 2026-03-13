import axios from 'axios';
import cheerio from 'react-native-cheerio';
import { sessionService } from './sessionService';
import { fingerprintService } from './fingerprintService';
import { useAuthStore } from '../store/useAuthStore';
import Constants from 'expo-constants';

const PORTAL_URL = 'https://edusmartz.ssuet.edu.pk/StudentPortal';

export type Subject = {
  id: string;
  name: string;
  teacher: string;
  totalClasses: number;
  present: number;
  absent: number;
  percentage: number;
  detailUrl?: string;
};

export type AttendanceData = {
  overallPercentage: number;
  subjects: Subject[];
};

export type LectureRecord = {
  date: string;
  status: 'P' | 'A' | 'L';
};

export type SubjectDetail = {
  subject: Subject;
  lectures: LectureRecord[];
};

export type UserProfile = {
  name: string;
  regNo: string;
  program: string;
  session: string;
  status: string;
  profilePicture?: string;
  cgpa: string;
  balance: string;
};

const createClient = async () => {
  const jar = await sessionService.loadJar();
  const client = axios.create({
    baseURL: PORTAL_URL,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Mobile; React Native SSUET App)',
    },
  });

  client.interceptors.request.use(async (config) => {
    const url = `${PORTAL_URL}${config.url ?? ''}`;
    const cookieHeader = await jar.getCookies(url)
      .then((cookies) => cookies.map((c) => c.cookieString()).join('; '))
      .catch(() => '');
    if (cookieHeader) {
      config.headers = config.headers ?? {};
      config.headers['Cookie'] = cookieHeader;
    }
    return config;
  });

  client.interceptors.response.use(
    async (response) => {
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        const url = response.config.url
          ? `${PORTAL_URL}${response.config.url}`
          : PORTAL_URL;
        const entries = Array.isArray(setCookie) ? setCookie : [setCookie];
        await Promise.all(entries.map((c: string) => jar.setCookie(c, url).catch(() => {})));
        await sessionService.saveJar(jar);
      }
      return response;
    },
    async (error) => {
      await sessionService.saveJar(jar);
      return Promise.reject(error);
    }
  );

  return client;
}

export const portalService = {
  async checkLatestVersion(): Promise<{ isLatest: boolean; latestVersion: string }> {
    try {
      const currentVersion = Constants.expoConfig?.version || '1.0.0';
      const res = await axios.get('https://api.github.com/repos/ashhadahmd/MarkD./releases/latest', {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
        timeout: 5000,
      });
      const latestTag = res.data.tag_name;
      const latestVersion = latestTag.replace(/^v/, '');
      return { isLatest: currentVersion === latestVersion, latestVersion };
    } catch (error) {
      return { isLatest: true, latestVersion: Constants.expoConfig?.version || '1.0.0' };
    }
  },

  async login(regNo: string, password: string): Promise<boolean> {
    try {
      const client = await createClient();
      const getRes = await client.get('/Login');
      const html: string = getRes.data;

      const extractInput = (id: string) =>
        html.match(new RegExp(`id="${id}"[^>]*value="([^"]*)"`)) ?.[1] ??
        html.match(new RegExp(`value="([^"]*)"[^>]*id="${id}"`))?.[1] ??
        '';

      const viewState = extractInput('__VIEWSTATE');
      const eventValidation = extractInput('__EVENTVALIDATION');
      const fingerprint = fingerprintService.generateFingerprint();

      const payload = new URLSearchParams({
        ScriptManager1: 'updatepanel|btnlgn',
        __EVENTTARGET: '',
        __EVENTARGUMENT: '',
        __VIEWSTATE: viewState || '',
        __VIEWSTATEGENERATOR: 'CE95E3B5',
        __EVENTVALIDATION: eventValidation || '',
        hdnFingerPrint: fingerprint,
        txtRegistrationNo_cs: regNo,
        txtPassword_m6cs: password,
        hdnClientName: 'SSUET',
        Checkbox1: '',
        __ASYNCPOST: 'true',
        btnlgn: 'Sign In'
      });

      const postRes = await client.post('/Login', payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-MicrosoftAjax': 'Delta=true',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      return !postRes.data.includes('Username/Password incorrect');
    } catch (e) {
      return false;
    }
  },

  toTitleCase(str: string): string {
    return str.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
  },

  parsePortalDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const day = parts[0];
    const monthStr = parts[1];
    let year = parts[2];
    if (year.length === 2) year = '20' + year;
    const months: { [key: string]: string } = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    const month = months[monthStr] || '01';
    return `${year}-${month}-${day.padStart(2, '0')}`;
  },

  async tryRenewSession(): Promise<boolean> {
    const { regNo, password } = useAuthStore.getState();
    if (regNo && password) {
      return await this.login(regNo, password);
    }
    return false;
  },

  async getAttendance(signal?: AbortSignal): Promise<AttendanceData> {
    const fetchWithRetry = async (retryCount = 0): Promise<AttendanceData> => {
      try {
        const client = await createClient();
        const res = await client.get('/attendance', { signal });
        const $ = cheerio.load(res.data);

        if ($('#btnlgn').length > 0) {
          if (retryCount === 0 && await this.tryRenewSession()) {
            return fetchWithRetry(1);
          }
          throw new Error('Session invalid');
        }

        const tableRows = $('#ctl00_ContentPlaceHolder1_TgridAttedance tr').toArray();
        if (tableRows.length > 0) tableRows.shift();

        const subjects: Subject[] = [];
        for (let i = 0; i < tableRows.length; i++) {
          const el = tableRows[i];
          const cols = $(el).find('td');
          if (cols.length < 6) continue;
          
          const courseRaw = $(cols[0]).text().trim();
          const nameMatch = courseRaw.match(/^(.*?)\s*\((.*?)\)$/);
          const name = this.toTitleCase(nameMatch ? nameMatch[1].trim() : courseRaw);
          const code = nameMatch ? nameMatch[2].trim() : 'sub';
          const id = `${code}-${i}`;
          const conducted = parseInt($(cols[3]).text().trim()) || 0;
          const present = parseInt($(cols[4]).text().trim()) || 0;
          const percentage = parseFloat($(cols[5]).text().replace('%', '').trim()) || 0;
          const detailUrl = $(cols[7]).find('a').attr('href') || '';

          subjects.push({
            id, name, teacher: 'Faculty Member',
            totalClasses: conducted, present,
            absent: conducted - present, percentage, detailUrl
          });
        }

        const totalConducted = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
        const totalPresent = subjects.reduce((sum, s) => sum + s.present, 0);
        const overallPercentage = totalConducted > 0 
          ? Math.round((totalPresent / totalConducted) * 1000) / 10 
          : 0;

        return { overallPercentage, subjects };
      } catch (error: any) {
        if (retryCount === 0 && (error.message.includes('Session invalid') || error.status === 401)) {
          if (await this.tryRenewSession()) return fetchWithRetry(1);
        }
        throw error;
      }
    };
    return fetchWithRetry();
  },

  async getSubjectDetail(subject: Subject, signal?: AbortSignal): Promise<SubjectDetail> {
    const fetchWithRetry = async (retryCount = 0): Promise<SubjectDetail> => {
      try {
        const client = await createClient();
        const requestUrl = subject.detailUrl!;
        const res = await client.get(requestUrl, { signal });
        const $ = cheerio.load(res.data);
        
        if ($('#btnlgn').length > 0) {
          if (retryCount === 0 && await this.tryRenewSession()) {
            return fetchWithRetry(1);
          }
          throw new Error('Session invalid');
        }

        let teacher = 'Faculty Member';
        const facultyLabel = $('label:contains("Faculty :"), span:contains("Faculty :")');
        if (facultyLabel.length > 0) {
          teacher = facultyLabel.parent().text().split('Faculty :')[1]?.trim() || 'Faculty Member';
        } else {
          teacher = $('#ctl00_ContentPlaceHolder1_lblFacultyName').text().trim() || 
                    $('#ctl00_ContentPlaceHolder1_lblFaculty').text().trim() || 'Faculty Member';
        }
        teacher = this.toTitleCase(teacher);

        const lectures: LectureRecord[] = [];
        let detailTable = $('#ctl00_ContentPlaceHolder1_TgridCourseAttedance');
        if (detailTable.length === 0) detailTable = $('#ctl00_ContentPlaceHolder1_gvAttendanceDetail');
        if (detailTable.length === 0) detailTable = $('#GridAttendanceDetail');
        
        detailTable.find('tr').each((i: number, el: any) => {
          if (i === 0) return;
          const cols = $(el).find('td');
          if (cols.length < 4) return;
          const date = this.parsePortalDate($(cols[2]).text().trim());
          const status = $(cols[3]).text().trim().toLowerCase().includes('present') ? 'P' : 'A';
          if (date) lectures.push({ date, status });
        });

        return { subject: { ...subject, teacher }, lectures };
      } catch (error: any) {
        if (retryCount === 0 && (error.message.includes('Session invalid') || error.status === 401)) {
          if (await this.tryRenewSession()) return fetchWithRetry(1);
        }
        throw error;
      }
    };
    return fetchWithRetry();
  },

  async logout(): Promise<void> {
    await sessionService.clearSession();
  },

  async getProfile(): Promise<UserProfile> {
    const fetchWithRetry = async (retryCount = 0): Promise<UserProfile> => {
      try {
        const client = await createClient();
        const res = await client.get('/Dashboard');
        const $ = cheerio.load(res.data);

        if ($('#btnlgn').length > 0) {
          if (retryCount === 0 && await this.tryRenewSession()) {
            return fetchWithRetry(1);
          }
          throw new Error('Failed to find student name on dashboard');
        }

        const nameElem = $('#ctl00_ContentPlaceHolder1_spnName');
        const name = this.toTitleCase(nameElem.text().trim() || 'Student');
        const regNo = $('#ctl00_ContentPlaceHolder1_spnRegNo').text().trim() || '';
        const program = $('#ctl00_ContentPlaceHolder1_spnProgramStructure').text().trim() || '';
        const session = $('#ctl00_ContentPlaceHolder1_spnCurrentSession').text().trim() || '';
        const status = $('#ctl00_ContentPlaceHolder1_spnActiveStatus').text().trim() || 'Active';
        const cgpaRaw = $('#ctl00_ContentPlaceHolder1_spnCGPA').text().trim();
        const cgpa = cgpaRaw.match(/\(([\d.]+)\)/)?.[1] || cgpaRaw.replace(/[^\d.]/g, '') || '0.00';
        const balanceRaw = $('#ctl00_ContentPlaceHolder1_lblCurrentBalance').text().trim();
        const balance = balanceRaw.match(/\(([\d.,-]+)\)/)?.[1]?.replace(/,/g, '') || balanceRaw.replace(/[^\d.-]/g, '') || '0';
        
        let profilePicture = $('#ctl00_Applicant_Pic').attr('src') || '';
        if (profilePicture && !profilePicture.startsWith('http')) {
          profilePicture = PORTAL_URL + profilePicture.replace(/^\//, '');
        }

        return { name, regNo, program, session, status, profilePicture, cgpa, balance };
      } catch (error: any) {
        if (retryCount === 0 && (error.message.includes('Failed to find') || error.status === 401)) {
          if (await this.tryRenewSession()) return fetchWithRetry(1);
        }
        throw error;
      }
    };
    return fetchWithRetry();
  },

  async isSessionValid(): Promise<boolean> {
    try {
      const jar = await sessionService.loadJar();
      const cookies = await jar.getCookies(PORTAL_URL);
      if (cookies.length === 0) return false;
      const client = await createClient();
      const res = await client.get('/Dashboard');
      const $ = cheerio.load(res.data);
      if ($('#btnlgn').length > 0) {
        await sessionService.clearSession();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
};

